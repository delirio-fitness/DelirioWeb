import { useCallback, useEffect, useRef, useState } from 'react';
import workoutPlan from '../../images/appScreenshots/workoutPlan.png';
import clickStart from '../../images/appScreenshots/clickStart.png';
import inSession from '../../images/appScreenshots/isession.png';
import postWorkoutPlanning from '../../images/appScreenshots/postWorkotPlanning.png';
import { PhoneScreenshotFrame } from './PhoneScreenshotFrame';

const sequence = [
  {
    number: '01', label: 'PLAN', detail: 'BUILD THE DAY', capture: 'PERSONALIZED TRAINING PLAN', image: workoutPlan,
    eyebrow: '01 / YOUR PLAN', heading: ['BUILT FOR YOU.', 'READY WHEN YOU ARE.'],
    body: 'Iris turns your goals, schedule, and training history into a clear workout you can act on—not another generic template.',
  },
  {
    number: '02', label: 'START', detail: 'ENTER THE WORKOUT', capture: 'EXERCISES + SESSION START', image: clickStart,
    eyebrow: '02 / START TRAINING', heading: ['FROM PLAN', 'TO MOTION.'],
    body: 'Open the workout, see what is ahead, and begin in one tap. The plan becomes a coached session without breaking your focus.',
  },
  {
    number: '03', label: 'SEE THE REP', detail: 'COACH THE MOVEMENT', capture: 'LIVE REPS + REST', image: inSession,
    eyebrow: '03 / LIVE GUIDANCE', heading: ['EVERY REP', 'BECOMES SIGNAL.'],
    body: 'Delirio follows the movement as it happens—tracking reps, rest, and session progress so guidance stays grounded in the work you actually do.',
  },
  {
    number: '04', label: 'KEEP GOING', detail: 'CARRY IT FORWARD', capture: 'POST-WORKOUT COACHING', image: postWorkoutPlanning,
    eyebrow: '04 / CONTINUOUS COACHING', heading: ['THE WORKOUT ENDS.', 'THE COACHING DOESN’T.'],
    body: 'Iris carries the session into the next conversation, helping you reflect, adjust, and know exactly what to do when you are ready to train again.',
  },
] as const;

const SEQUENCE_INTERVAL_MS = 3000;

export function PlanToLiveGuidance() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const activateStage = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const startSequence = useCallback(() => {
    if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      intervalRef.current = null;
      return;
    }

    intervalRef.current = window.setInterval(() => {
      activateStage((activeIndexRef.current + 1) % sequence.length);
    }, SEQUENCE_INTERVAL_MS);
  }, [activateStage]);

  const selectStage = (index: number) => {
    activateStage(index);
    startSequence();
  };

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) return undefined;

    startSequence();

    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, [startSequence]);

  return (
    <section className="d3-plan-live" aria-labelledby="plan-live-title">
      <div className="d3-plan-live-top-rule" aria-hidden="true" />

      <div className="d3-plan-live-menu" aria-label="Product journey chapters">
        {sequence.map((stage, index) => (
          <button
            className={index === activeIndex ? 'is-active' : ''}
            key={stage.number}
            type="button"
            aria-pressed={index === activeIndex}
            onClick={() => selectStage(index)}
          >
            <b>{stage.number}</b>
            <span><strong>{stage.label}</strong><small>{stage.detail}</small></span>
          </button>
        ))}
      </div>

      <div className="d3-plan-live-stage" aria-live="polite">
        <div className="d3-plan-live-capture" key={`capture-${activeIndex}`}>
          <PhoneScreenshotFrame
            src={sequence[activeIndex].image}
            alt={`${sequence[activeIndex].label}: ${sequence[activeIndex].capture}`}
          />
        </div>
      </div>

      <div className="d3-plan-live-editorial">
        <div className="d3-sequence-content" key={activeIndex} aria-live="polite">
          <p className="d3-sequence-eyebrow">{sequence[activeIndex].eyebrow}</p>
          <h2 id="plan-live-title">
            {sequence[activeIndex].heading.map((line) => <span key={line}>{line}</span>)}
          </h2>
          <p className="d3-plan-live-body">{sequence[activeIndex].body}</p>
        </div>
        <p className="d3-plan-live-archive">REAL DELIRIO PRODUCT CAPTURES / ARCHIVE 04.16.26</p>
        <div className="d3-plan-live-rule" aria-hidden="true" />
        <p className="d3-plan-live-note">The screens are shown as product evidence. Preserve their interface, proportions, and visual hierarchy in implementation.</p>
      </div>

    </section>
  );
}
