import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps } from 'react';
import {
  WAITLIST_QUESTIONS,
  type WaitlistAnswers,
  type WaitlistQuestionId,
} from '../../content/waitlistQuestions';
import { WaitlistClaim } from './WaitlistClaim';

/** How long a chosen option stays lit before the next question replaces it. */
const ANSWER_CONFIRMATION_MS = 450;

type WaitlistStepsProps = {
  answers: WaitlistAnswers;
  onAnswer: (questionId: WaitlistQuestionId, value: string) => void;
  claim: ComponentProps<typeof WaitlistClaim>;
  startAtFirstQuestion: boolean;
};

type Phase = 'intro' | 'questions' | 'waitlist';

/**
 * One question per screen, advancing on selection, waitlist last.
 *
 * The visitor never sees more than one decision at a time, which makes the set
 * feel shorter than it is — but it also hides how long the set is, so the
 * progress bar carries the whole promise that this ends.
 */
export function WaitlistSteps({
  answers,
  onAnswer,
  claim,
  startAtFirstQuestion,
}: WaitlistStepsProps) {
  const [phase, setPhase] = useState<Phase>(startAtFirstQuestion ? 'questions' : 'intro');
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
      setPhase('waitlist');
      return;
    }

    setIsAdvancing(true);
    advanceTimerRef.current = window.setTimeout(() => {
      setIsAdvancing(false);
      advanceTimerRef.current = null;
      setStep((current) => current + 1);
    }, ANSWER_CONFIRMATION_MS);
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
        </div>
      </div>
    </>
  );
}
