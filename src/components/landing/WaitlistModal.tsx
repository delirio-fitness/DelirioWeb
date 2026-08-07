import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { resolveWaitlistOrder, type WaitlistOrder } from '../../config/waitlistOrder';
import {
  isComplete,
  toResponses,
  type WaitlistAnswers,
  type WaitlistQuestionId,
} from '../../content/waitlistQuestions';
import {
  submitWaitlistAnswersToFirestore,
  submitWaitlistEmailToFirestore,
  updateWaitlistAnswersInFirestore,
} from '../../services/feedbackSubmission';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';
import { WaitlistSteps } from './WaitlistSteps';

type WaitlistModalProps = {
  invocationId?: number;
  open?: boolean;
  onClose?: () => void;
  /** Skips the intro screen, for a visitor who already chose the waitlist off-page. */
  startAtFirstQuestion?: boolean;
  /** Test seam: pins the order instead of reading `?wo=`. */
  order?: WaitlistOrder;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * The waitlist gate: one question per screen, in the order `?wo=` selects.
 *
 * A second design once rendered all six questions on a single card, chosen with
 * `?wl=`. It is gone — `WaitlistSinglePage`, `config/waitlistDesign`, and the
 * `design` field on new Firestore records went with it. Records written before
 * that still carry `design: 'steps' | 'single'`; nothing writes it now, so its
 * presence is what dates a document.
 *
 * In the questions-first control, answers are saved the moment the last one is
 * given, before the email is requested, so abandoning at the email box still
 * leaves a usable read on demand. The save runs in the background rather than
 * gating the email screen; `resolveSubmissionId` below is what keeps a fast
 * typist from racing it. The email-first arm inverts this — see `submitEmailFirst`.
 */
export function WaitlistModal({
  invocationId,
  open: controlledOpen,
  onClose,
  startAtFirstQuestion = false,
  order: pinnedOrder,
}: WaitlistModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [answers, setAnswers] = useState<WaitlistAnswers>({});
  const [openResponse, setOpenResponse] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [order] = useState<WaitlistOrder>(() => pinnedOrder ?? resolveWaitlistOrder());
  const emailFirst = order === 'email';
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const ownsHistoryEntryRef = useRef(false);
  const previousInvocationRef = useRef(invocationId);
  // The id of the answer document, and the write that produces it. The email
  // step awaits the promise so a submit that lands mid-write still attaches to
  // the answers instead of forking off a second, anonymous record.
  const submissionIdRef = useRef<string | null>(null);
  const savePromiseRef = useRef<Promise<string | null> | null>(null);
  // What the stored record already says the free text is, so a blur that
  // changed nothing does not spend a write.
  const savedOpenResponseRef = useRef('');
  const isOpen = controlledOpen ?? internalOpen;

  const resetQuestionnaire = useCallback(() => {
    setAnswers({});
    setOpenResponse('');
    setSaveFailed(false);
    submissionIdRef.current = null;
    savePromiseRef.current = null;
    savedOpenResponseRef.current = '';
  }, []);

  const closeQuestionnaire = useCallback(() => {
    if (!isOpen) return;

    // Pop the entry rather than stripping its marker. `pushState` used the
    // current URL, so an entry left behind is a duplicate of the page already
    // on screen: the visitor's next Back press would traverse to it and look
    // like nothing happened. Clearing the ref first keeps `handlePopState` from
    // closing a second time when this lands.
    if (ownsHistoryEntryRef.current && window.history.state?.delirioQuestionnaire) {
      ownsHistoryEntryRef.current = false;
      window.history.back();
    }

    if (onClose) onClose();
    else setInternalOpen(false);
  }, [isOpen, onClose]);

  useLayoutEffect(() => {
    if (invocationId === undefined || invocationId === previousInvocationRef.current) return;
    previousInvocationRef.current = invocationId;
    resetQuestionnaire();
  }, [invocationId, resetQuestionnaire]);

  const saveAnswers = useCallback(
    (nextAnswers: WaitlistAnswers) => {
      const responses = toResponses(nextAnswers);
      const inFlight = savePromiseRef.current;

      const save = (async () => {
        // Writes replace the whole `responses` array, and email-first sends one
        // per question — 450ms apart, which is well inside what a Firestore
        // round trip can take. Two in flight at once can land in either order,
        // and an older array winning silently drops the newer answers, which is
        // exactly the case that arm exists to capture. So they queue.
        //
        // Reading the id after the wait rather than before also means an answer
        // given while the record is still being created patches that record
        // instead of forking a second one.
        await inFlight?.catch(() => null);
        const existingId = submissionIdRef.current;

        try {
          const submissionId = existingId
            ? await updateWaitlistAnswersInFirestore(existingId, responses)
            : await submitWaitlistAnswersToFirestore(getBrowserFeedbackId(), responses, order);
          submissionIdRef.current = submissionId;
          setSaveFailed(false);
          // Nothing is reported to Meta from inside this gate, and nothing may
          // be — an ad event fired anywhere downstream of the questions
          // discloses health through its timing, whatever its payload omits.
          // The conversion for this flow is `waitlist_started`, reported in
          // `Landing.tsx` before the first question renders. The rule and the
          // reasoning live in `services/conversionEvents`; do not re-derive it
          // from how tame the current questions look.
          return submissionId;
        } catch (error) {
          // Loud on purpose. The email box still works without this —
          // `WishlistSignup` falls back to a standalone record — so a failed
          // write must not block the ask, but the whole point of the questions
          // is the demand read, and silently losing it would go unnoticed.
          console.error('[delirio-waitlist] answers were not saved', error);
          setSaveFailed(true);
          return null;
        }
      })();

      savedOpenResponseRef.current = nextAnswers.openResponse?.trim() ?? '';
      savePromiseRef.current = save;
      return save;
    },
    [order],
  );

  /**
   * Email-first entry point: the address creates the record, and the answers are
   * patched onto it afterwards — the exact reverse of the control.
   *
   * Every record from this arm therefore carries an email, which is what keeps
   * it out of the "we cannot find your entry to delete it" case the privacy
   * policy has to describe for the control.
   */
  const submitEmailFirst = useCallback(
    async (email: string) => {
      const create = (async () => {
        const submissionId = await submitWaitlistEmailToFirestore(
          getBrowserFeedbackId(),
          email,
          order,
        );
        submissionIdRef.current = submissionId;
        setSaveFailed(false);
        return submissionId;
      })();

      // Puts the create at the head of the same queue the answer writes use, so
      // an answer that arrives before it resolves waits for the id rather than
      // starting a second record.
      savePromiseRef.current = create;
      await create;
    },
    [order],
  );

  const answerQuestion = useCallback(
    (questionId: WaitlistQuestionId, value: string) => {
      setAnswers((current) => {
        const next = { ...current, [questionId]: value };
        // Email-first patches every answer as it arrives, because the record
        // already exists and skipping is offered on every screen — a visitor who
        // leaves after two questions should still leave those two behind.
        // Questions-first has nothing to patch until the set is complete.
        if (emailFirst || isComplete(next)) void saveAnswers(next);
        return next;
      });
    },
    [emailFirst, saveAnswers],
  );

  /**
   * Writes the free text on blur rather than on every keystroke.
   *
   * Clicking `JOIN` blurs the textarea first, so the write is already in flight
   * by the time the email submits — and `resolveSubmissionId` awaits whatever
   * the latest write is, so the two cannot land out of order. Typing and then
   * abandoning still keeps the text, which is the case worth protecting.
   */
  const commitOpenResponse = useCallback(() => {
    const trimmed = openResponse.trim();
    if (trimmed === savedOpenResponseRef.current) return;
    // Nothing to attach it to yet: the questions gate this field, so this only
    // happens if the first write failed. It rides along with the email instead.
    if (!submissionIdRef.current) return;
    void saveAnswers({ ...answers, openResponse: trimmed });
  }, [answers, openResponse, saveAnswers]);

  const resolveSubmissionId = useCallback(
    () => savePromiseRef.current ?? Promise.resolve(submissionIdRef.current),
    [],
  );

  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const existingState =
      window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    window.history.pushState(
      { ...existingState, delirioQuestionnaire: true },
      '',
      window.location.href,
    );
    ownsHistoryEntryRef.current = true;

    const handlePopState = () => {
      if (!ownsHistoryEntryRef.current) return;
      ownsHistoryEntryRef.current = false;
      if (onClose) onClose();
      else setInternalOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeQuestionnaire();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      );
      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialogRef.current.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [closeQuestionnaire, isOpen, onClose]);

  if (!isOpen) return null;

  const claim = {
    openResponse,
    onOpenResponseChange: setOpenResponse,
    onCommitOpenResponse: commitOpenResponse,
    onResolveSubmissionId: resolveSubmissionId,
    saveFailed,
  };

  const body = (
    <WaitlistSteps
      answers={answers}
      onAnswer={answerQuestion}
      claim={claim}
      startAtFirstQuestion={startAtFirstQuestion}
      order={order}
      onSubmitEmail={emailFirst ? submitEmailFirst : undefined}
    />
  );

  return createPortal(
    <div
      className="d3-questionnaire-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeQuestionnaire();
      }}
    >
      <div
        ref={dialogRef}
        className="d3-questionnaire d3-questionnaire--steps"
        role="dialog"
        aria-modal="true"
        aria-labelledby="questionnaire-question"
        tabIndex={-1}
      >
        <button
          className="d3-questionnaire-close"
          type="button"
          aria-label="Close waitlist form"
          onClick={closeQuestionnaire}
        >
          <X aria-hidden="true" />
        </button>
        {body}
      </div>
    </div>,
    document.body,
  );
}
