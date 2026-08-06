import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import {
  DEFAULT_WAITLIST_DESIGN,
  resolveWaitlistDesign,
  type WaitlistDesign,
} from '../../config/waitlistDesign';
import {
  isComplete,
  toResponses,
  type WaitlistAnswers,
  type WaitlistQuestionId,
} from '../../content/waitlistQuestions';
import {
  submitWaitlistAnswersToFirestore,
  updateWaitlistAnswersInFirestore,
} from '../../services/feedbackSubmission';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';
import { WaitlistSinglePage } from './WaitlistSinglePage';
import { WaitlistSteps } from './WaitlistSteps';

type WaitlistModalProps = {
  invocationId?: number;
  open?: boolean;
  onClose?: () => void;
  /** Skips the stepped design's intro screen. The single-page design has none. */
  startAtFirstQuestion?: boolean;
  /** Test seam: pins the design instead of reading `?wl=`. */
  design?: WaitlistDesign;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * The waitlist gate.
 *
 * Asks the filter questions, then — and only then — asks for an email. Two
 * designs render the same questions and write the same record; `?wl=` picks
 * between them (see `config/waitlistDesign`).
 *
 * Answers are saved the moment the last one is given, before the email is
 * requested, so abandoning at the email box still leaves a usable read on
 * demand. The save runs in the background rather than gating the email screen;
 * `resolveSubmissionId` below is what keeps a fast typist from racing it.
 */
export function WaitlistModal({
  invocationId,
  open: controlledOpen,
  onClose,
  startAtFirstQuestion = false,
  design: pinnedDesign,
}: WaitlistModalProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [answers, setAnswers] = useState<WaitlistAnswers>({});
  const [openResponse, setOpenResponse] = useState('');
  const [saveFailed, setSaveFailed] = useState(false);
  const [design] = useState<WaitlistDesign>(
    () => pinnedDesign ?? resolveWaitlistDesign() ?? DEFAULT_WAITLIST_DESIGN,
  );
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
    if (onClose) onClose();
    else setInternalOpen(false);

    if (ownsHistoryEntryRef.current && window.history.state?.delirioQuestionnaire) {
      ownsHistoryEntryRef.current = false;
      const { delirioQuestionnaire: _questionnaireMarker, ...restoredState } = window.history.state;
      window.history.replaceState(restoredState, '', window.location.href);
    }
  }, [isOpen, onClose]);

  useLayoutEffect(() => {
    if (invocationId === undefined || invocationId === previousInvocationRef.current) return;
    previousInvocationRef.current = invocationId;
    resetQuestionnaire();
  }, [invocationId, resetQuestionnaire]);

  const saveAnswers = useCallback(
    (nextAnswers: WaitlistAnswers) => {
      const responses = toResponses(nextAnswers);
      const existingId = submissionIdRef.current;

      const save = (async () => {
        try {
          const submissionId = existingId
            ? await updateWaitlistAnswersInFirestore(existingId, responses)
            : await submitWaitlistAnswersToFirestore(getBrowserFeedbackId(), responses, design);
          submissionIdRef.current = submissionId;
          setSaveFailed(false);
          // Nothing is reported to Meta from inside this gate, and nothing may
          // be. The questions ask about weight progress and physical capacity,
          // so an ad event fired anywhere downstream of them discloses health
          // through its timing — the payload does not have to carry the answer.
          // The conversion for this flow is `waitlist_started`, reported in
          // `Landing.tsx` before the first question renders. See
          // `services/conversionEvents`.
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
    [design],
  );

  const answerQuestion = useCallback(
    (questionId: WaitlistQuestionId, value: string) => {
      setAnswers((current) => {
        const next = { ...current, [questionId]: value };
        if (isComplete(next)) void saveAnswers(next);
        return next;
      });
    },
    [saveAnswers],
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

  const body =
    design === 'single' ? (
      <WaitlistSinglePage answers={answers} onAnswer={answerQuestion} claim={claim} />
    ) : (
      <WaitlistSteps
        answers={answers}
        onAnswer={answerQuestion}
        claim={claim}
        startAtFirstQuestion={startAtFirstQuestion}
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
        className={`d3-questionnaire d3-questionnaire--${design}`}
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
