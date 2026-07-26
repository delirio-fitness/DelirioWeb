import { useEffect, useRef, useState } from 'react';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';

const feedbackQuestions = [
  {
    id: 'wish',
    prompt: 'What do you wish Delirio could help you do?',
    options: ['Build a personalized workout plan', 'Improve my form while I train', 'Stay consistent and accountable', 'Understand my progress better'],
  },
  {
    id: 'coachingUsefulness',
    prompt: 'What would make the coaching experience more useful to you?',
    options: ['More personalized guidance', 'Faster feedback during workouts', 'Better adjustments after each session', 'More motivation and accountability'],
  },
  {
    id: 'nextBuild',
    prompt: 'What should we build or improve next?',
    options: ['Smarter workout planning', 'Deeper progress insights', 'More ways to talk with your coach', 'More exercise and form support'],
  },
] as const;

const TOTAL_STEPS = feedbackQuestions.length;
const ANSWER_CONFIRMATION_MS = 450;

type Answers = Record<(typeof feedbackQuestions)[number]['id'], string>;

const emptyAnswers: Answers = {
  wish: '',
  coachingUsefulness: '',
  nextBuild: '',
};

export function FeedbackSection() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
  }, []);

  const resetQuestionnaire = () => {
    setStep(0);
    setAnswers(emptyAnswers);
    setStatus('idle');
    setError(null);
    setIsAdvancing(false);
  };

  const submitFeedback = async (submissionAnswers: Answers) => {
    if (status === 'submitting') return;

    try {
      setError(null);
      setStatus('submitting');
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browserId: getBrowserFeedbackId(), ...submissionAnswers, website: '' }),
      });
      const result = await response.json().catch(() => null) as { error?: string } | null;
      if (!response.ok) throw new Error(result?.error || 'Unable to submit feedback right now.');
      setStatus('success');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to submit feedback right now.');
      setStatus('idle');
    }
  };

  const selectAnswer = (questionId: keyof Answers, option: string) => {
    if (status === 'submitting' || isAdvancing) return;
    const nextAnswers = { ...answers, [questionId]: option };
    setAnswers(nextAnswers);
    setError(null);
    setIsAdvancing(true);

    advanceTimerRef.current = window.setTimeout(() => {
      setIsAdvancing(false);
      advanceTimerRef.current = null;
      if (step < TOTAL_STEPS - 1) {
        setStep((current) => current + 1);
      } else {
        void submitFeedback(nextAnswers);
      }
    }, ANSWER_CONFIRMATION_MS);
  };

  const activeQuestion = feedbackQuestions[step];

  return (
    <section className="d3-feedback-launch" aria-label="Product questionnaire">
      <div className="d3-questionnaire is-inline" role="region" aria-labelledby="questionnaire-question">
            <div className="d3-questionnaire-header">
              {status !== 'success' && step > 0 && (
                <button className="d3-questionnaire-back" type="button" disabled={isAdvancing} onClick={() => { setStep((current) => current - 1); setError(null); }}>
                  ← BACK
                </button>
              )}
              {status !== 'success' && (
                <div className="d3-questionnaire-progress" aria-label={`Question ${step + 1} of ${TOTAL_STEPS}`}>
                  <span>{step + 1}/{TOTAL_STEPS}</span>
                  <i><b style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} /></i>
                </div>
              )}
            </div>

            {status === 'success' ? (
              <div className="d3-questionnaire-success" role="status">
                <h2 id="questionnaire-question">Thank you.</h2>
                <p>You helped shape what Delirio builds next.</p>
                <button type="button" onClick={resetQuestionnaire}>ANSWER AGAIN</button>
              </div>
            ) : (
              <div className="d3-questionnaire-form">
                <div className="d3-questionnaire-step">
                  <h2 id="questionnaire-question">
                    {activeQuestion.prompt}
                  </h2>
                  <fieldset className="d3-questionnaire-options" aria-labelledby="questionnaire-question">
                    {activeQuestion.options.map((option) => (
                      <label key={option}>
                        <input
                          type="radio"
                          name={activeQuestion.id}
                          value={option}
                          checked={answers[activeQuestion.id] === option}
                          disabled={status === 'submitting' || isAdvancing}
                          onChange={() => selectAnswer(activeQuestion.id, option)}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>

                  {error && <p className="d3-questionnaire-error" role="alert">{error}</p>}
                  {status === 'submitting' && <p className="d3-questionnaire-saving" role="status">SAVING YOUR ANSWERS…</p>}
                </div>
              </div>
            )}
      </div>
    </section>
  );
}
