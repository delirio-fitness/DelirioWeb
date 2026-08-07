import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import {
  WAITLIST_QUESTIONS,
  type WaitlistAnswers,
  type WaitlistQuestionId,
} from '../../content/waitlistQuestions';
import { DEFAULT_WAITLIST_ORDER, type WaitlistOrder } from '../../config/waitlistOrder';
import { WaitlistClaim } from './WaitlistClaim';
import { WishlistSignup } from './WishlistSignup';

/** How long a chosen option stays lit before the next question replaces it. */
const ANSWER_CONFIRMATION_MS = 450;

type WaitlistStepsProps = {
  answers: WaitlistAnswers;
  onAnswer: (questionId: WaitlistQuestionId, value: string) => void;
  claim: ComponentProps<typeof WaitlistClaim>;
  startAtFirstQuestion: boolean;
  /** Which sequence to run. See `config/waitlistOrder` for the experiment. */
  order?: WaitlistOrder;
  /** Email-first only: persists the address, creating the record. */
  onSubmitEmail?: (email: string) => Promise<void>;
};

type Phase = 'intro' | 'email' | 'questions' | 'waitlist' | 'done';

/**
 * One question per screen, advancing on selection.
 *
 * The visitor never sees more than one decision at a time, which makes the set
 * feel shorter than it is — but it also hides how long the set is, so the
 * progress bar carries the whole promise that this ends.
 *
 * Two sequences run through the same screens:
 *
 * - `questions` — intro, six questions, then the email. The questions gate the
 *   address, so answering is the price of joining.
 * - `email` — the address first, then the same six questions with a standing
 *   offer to skip them. Nothing is gated, so answering is a favour rather than
 *   a toll, and every record is reachable by email afterwards.
 */
export function WaitlistSteps({
  answers,
  onAnswer,
  claim,
  startAtFirstQuestion,
  order = DEFAULT_WAITLIST_ORDER,
  onSubmitEmail,
}: WaitlistStepsProps) {
  const emailFirst = order === 'email';
  const [phase, setPhase] = useState<Phase>(
    // Email-first ignores `startAtFirstQuestion`: the flag exists to skip the
    // intro for someone who already chose the waitlist off-page, and the email
    // box is what that person came for.
    emailFirst ? 'email' : startAtFirstQuestion ? 'questions' : 'intro',
  );
  const [step, setStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const activeQuestion = WAITLIST_QUESTIONS[step];
  const isLastQuestion = step >= WAITLIST_QUESTIONS.length - 1;

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  // Before paint, not in a frame callback: a deferred focus can land after the
  // visitor has already clicked into the email box on the last screen, and the
  // keystrokes they have typed by then go nowhere.
  useLayoutEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [phase, step]);

  function selectAnswer(questionId: WaitlistQuestionId, value: string) {
    if (isAdvancing) return;
    onAnswer(questionId, value);

    if (isLastQuestion) {
      // Email-first has nothing left to ask for — the address arrived first —
      // so the run ends on a thank-you rather than a form.
      setPhase(emailFirst ? 'done' : 'waitlist');
      return;
    }

    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      setIsAdvancing(false);
      advanceTimerRef.current = null;
      setStep((current) => current + 1);
    }, ANSWER_CONFIRMATION_MS);
  }

  if (phase === 'email') {
    return (
      <div className="d3-questionnaire-intro d3-questionnaire-email-first">
        <p>NO QUESTIONS FIRST</p>
        <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
          YOUR SPOT IS RESERVED.
        </h2>
        <span>
          Delirio is opening in stages. Leave your email and we will tell you when your spot is
          ready — that is the whole requirement.
        </span>
        {/* This screen is the first thing the gate shows in this arm, so the
            address arrives with no question seen and the conversion is clean.
            The closing screen's box in the other arm is not — see
            `WishlistSignup` and `services/conversionEvents`. */}
        <WishlistSignup
          placement="questionnaire"
          upstreamOfQuestions
          onSubmitEmail={async (email) => {
            if (onSubmitEmail) await onSubmitEmail(email);
            setPhase('questions');
          }}
        />
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="d3-questionnaire-waitlist">
        <p>THAT IS EVERYTHING WE NEEDED</p>
        <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
          YOU’RE ON THE WAITLIST.
        </h2>
        <span>We will email you when your spot is ready.</span>
        <WaitlistClaim {...claim} withEmail={false} />
      </div>
    );
  }

  if (phase === 'intro') {
    return (
      <div className="d3-questionnaire-intro">
        <p>BEFORE YOU JOIN</p>
        <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
          {WAITLIST_QUESTIONS.length} QUESTIONS, THEN YOUR SPOT.
        </h2>
        <span>
          Delirio is opening in stages. Your answers tell us who to open to first and what to
          build for them, so we ask before we take your email.
        </span>
        <button type="button" onClick={() => setPhase('questions')}>
          START — TAKES A MINUTE
        </button>
      </div>
    );
  }

  if (phase === 'waitlist') {
    return (
      <div className="d3-questionnaire-waitlist">
        <p>THAT IS EVERYTHING WE NEEDED</p>
        <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
          YOUR SPOT IS READY TO CLAIM.
        </h2>
        <WaitlistClaim {...claim} />
      </div>
    );
  }

  return (
    <>
      <div className="d3-questionnaire-header">
        {step > 0 && (
          <button
            className="d3-questionnaire-back"
            type="button"
            disabled={isAdvancing}
            onClick={() => setStep((current) => current - 1)}
          >
            ← BACK
          </button>
        )}
        <div
          className="d3-questionnaire-progress"
          role="progressbar"
          aria-label={`Question ${step + 1} of ${WAITLIST_QUESTIONS.length}`}
          aria-valuemin={1}
          aria-valuemax={WAITLIST_QUESTIONS.length}
          aria-valuenow={step + 1}
        >
          <i>
            <b style={{ width: `${((step + 1) / WAITLIST_QUESTIONS.length) * 100}%` }} />
          </i>
        </div>
      </div>

      <div className="d3-questionnaire-form">
        <div className="d3-questionnaire-step">
          <p className="d3-questionnaire-counter">
            QUESTION {step + 1} / {WAITLIST_QUESTIONS.length}
          </p>
          <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
            {activeQuestion.prompt}
          </h2>
          {activeQuestion.note && (
            <p className="d3-questionnaire-note" id="questionnaire-note">
              {activeQuestion.note}
            </p>
          )}
          <fieldset
            className="d3-questionnaire-options"
            aria-labelledby="questionnaire-question"
            aria-describedby={activeQuestion.note ? 'questionnaire-note' : undefined}
          >
            {activeQuestion.options.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name={activeQuestion.id}
                  value={option.value}
                  checked={answers[activeQuestion.id] === option.value}
                  disabled={isAdvancing}
                  onClick={() => {
                    // Re-picking the same option is still an answer, and without
                    // this a visitor who went back and kept their choice would
                    // sit on a screen that no longer advances.
                    if (answers[activeQuestion.id] === option.value) {
                      selectAnswer(activeQuestion.id, option.value);
                    }
                  }}
                  onChange={() => selectAnswer(activeQuestion.id, option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </fieldset>

          {/* Email-first only, and it has to be visible rather than a buried
              link: the whole point of this arm is that answering is optional,
              and an opt-out nobody can find is not one. Questions-first has no
              skip because there the answers are what unlock the email box. */}
          {emailFirst && (
            <button
              className="d3-questionnaire-skip"
              type="button"
              disabled={isAdvancing}
              onClick={() => setPhase('done')}
            >
              Skip for now →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
