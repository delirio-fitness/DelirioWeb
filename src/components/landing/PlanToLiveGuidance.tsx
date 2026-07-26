import { useCallback, useEffect, useRef, useState } from 'react';
import workoutPlan from '../../images/appScreenshots/workoutPlan.png';
import clickStart from '../../images/appScreenshots/clickStart.png';
import inSession from '../../images/appScreenshots/isession.png';
import postWorkoutPlanning from '../../images/appScreenshots/postWorkotPlanning.png';
import { PhoneScreenshotFrame } from './PhoneScreenshotFrame';

const sequence = [
  {
    number: '01', label: 'PLAN', detail: 'BUILD THE WEEK', capture: 'YOUR TRAINING PLAN', image: workoutPlan,
    eyebrow: '01 / YOUR PLAN', heading: ['A PLAN FOR', 'THE WEEK YOU HAVE.'],
    body: 'Your schedule, experience, equipment, and available time shape a clear workout you can review and change.',
  },
  {
    number: '02', label: 'START', detail: 'ENTER THE WORKOUT', capture: 'EXERCISES + SESSION START', image: clickStart,
    eyebrow: '02 / START TRAINING', heading: ['SEE WHAT’S AHEAD.', 'START WHEN READY.'],
    body: 'Open the workout, understand what is planned, and begin when you are ready. The plan becomes a guided session without adding more decisions.',
  },
  {
    number: '03', label: 'SEE THE REP', detail: 'COACH THE MOVEMENT', capture: 'LIVE REPS + REST', image: inSession,
    eyebrow: '03 / LIVE GUIDANCE', heading: ['SEE WHAT CHANGED.', 'KNOW WHAT COMES NEXT.'],
    body: 'Delirio follows supported movement details, reps, and rest as the session unfolds, then explains what mattered and what you can adjust.',
  },
  {
    number: '04', label: 'KEEP GOING', detail: 'CARRY IT FORWARD', capture: 'POST-WORKOUT COACHING', image: postWorkoutPlanning,
    eyebrow: '04 / CONTINUOUS COACHING', heading: ['THE WORKOUT ENDS.', 'THE CONTEXT CONTINUES.'],
    body: 'Your coach carries the session forward so you can review what happened, adjust the plan, and return without starting over.',
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
        <p className="d3-plan-live-archive">REAL DELIRIO PRODUCT SCREENS</p>
        <div className="d3-plan-live-rule" aria-hidden="true" />
        <p className="d3-plan-live-note">See how planning, live guidance, and follow-up connect inside Delirio.</p>
      </div>

    </section>
  );
}
