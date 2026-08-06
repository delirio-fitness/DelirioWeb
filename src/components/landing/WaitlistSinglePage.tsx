import { useEffect, useLayoutEffect, useRef, type ComponentProps } from 'react';
import { Lock } from 'lucide-react';
import {
  WAITLIST_QUESTIONS,
  answeredCount,
  isComplete,
  type WaitlistAnswers,
  type WaitlistQuestionId,
} from '../../content/waitlistQuestions';
import { WaitlistClaim } from './WaitlistClaim';

type WaitlistSinglePageProps = {
  answers: WaitlistAnswers;
  onAnswer: (questionId: WaitlistQuestionId, value: string) => void;
  claim: ComponentProps<typeof WaitlistClaim>;
};

/**
 * Every question on one card, with the email box locked underneath.
 *
 * The whole ask is visible from the first second — five questions, then an
 * email — so nobody is deciding whether to continue without knowing what
 * continuing costs. The counter on the locked panel is the only thing doing the
 * pulling, which is why it names what is left rather than what is done.
 */
export function WaitlistSinglePage({ answers, onAnswer, claim }: WaitlistSinglePageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const complete = isComplete(answers);
  const answered = answeredCount(answers);
  const remaining = WAITLIST_QUESTIONS.length - answered;

  // Before paint, so it cannot land after the visitor has started typing.
  useLayoutEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, []);

  // The form appears well below the fold on a phone, so unlocking it silently
  // would read as nothing having happened.
  useEffect(() => {
    if (!complete) return;
    const frame = window.requestAnimationFrame(() =>
      gateRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [complete]);

  return (
    <div className="d3-questionnaire-single">
      <header className="d3-questionnaire-single-intro">
        <p>BEFORE YOU JOIN</p>
        <h2 ref={headingRef} id="questionnaire-question" tabIndex={-1}>
          {WAITLIST_QUESTIONS.length} QUESTIONS, THEN YOUR SPOT.
        </h2>
        <span>
          Delirio is opening in stages. Your answers tell us who to open to first and what to
          build for them, so we ask before we take your email.
        </span>
      </header>

      <ol className="d3-questionnaire-single-list">
        {WAITLIST_QUESTIONS.map((question, index) => {
          const answeredHere = Boolean(answers[question.id]);
          return (
            <li className="d3-questionnaire-single-block" key={question.id}>
              {/* The options keep their own grid container: a `legend` inside a
                  grid fieldset is laid out inconsistently across browsers. */}
              <fieldset
                className={`d3-questionnaire-single-field${answeredHere ? ' is-answered' : ''}`}
              >
                <legend>
                  <i aria-hidden="true">{String(index + 1).padStart(2, '0')}</i>
                  <b>{question.prompt}</b>
                </legend>
                {question.note && <p className="d3-questionnaire-note">{question.note}</p>}
                <div className="d3-questionnaire-options">
                  {question.options.map((option) => (
                    <label key={option.value}>
                      <input
                        type="radio"
                        name={question.id}
                        value={option.value}
                        checked={answers[question.id] === option.value}
                        onChange={() => onAnswer(question.id, option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          );
        })}
      </ol>

      <div className="d3-questionnaire-single-gate" ref={gateRef}>
        {complete ? (
          <>
            <h3>YOUR SPOT IS READY TO CLAIM.</h3>
            <WaitlistClaim {...claim} />
          </>
        ) : (
          <div className="d3-questionnaire-single-locked" aria-live="polite">
            <Lock aria-hidden="true" />
            <strong>
              {remaining} {remaining === 1 ? 'question' : 'questions'} left to unlock your spot
            </strong>
            <span>
              Answer all {WAITLIST_QUESTIONS.length} and the waitlist opens right here.
            </span>
            <div
              className="d3-questionnaire-single-meter"
              role="progressbar"
              aria-label={`${answered} of ${WAITLIST_QUESTIONS.length} questions answered`}
              aria-valuemin={0}
              aria-valuemax={WAITLIST_QUESTIONS.length}
              aria-valuenow={answered}
            >
              <i>
                <b style={{ width: `${(answered / WAITLIST_QUESTIONS.length) * 100}%` }} />
              </i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
