import { useCallback, useEffect, useRef, useState } from 'react';

const sequence = [
  { number: '01', label: 'PLAN', detail: 'OPEN THE DAY', capture: 'HOME + TODAY’S PLAN' },
  { number: '02', label: 'START', detail: 'ENTER THE SESSION', capture: 'COACH + SESSION START' },
  { number: '03', label: 'SEE THE REP', detail: 'READ THE MOVEMENT', capture: 'LIVE MOVEMENT GUIDANCE' },
  { number: '04', label: 'KEEP GOING', detail: 'BUILD THE NEXT MOVE', capture: 'PROGRESS + NEXT STEP' },
] as const;

const sequenceContent = [
  <h1 key="index-0">Index 0</h1>,
  <h1 key="index-1">Index 1</h1>,
  <h1 key="index-2">Index 2</h1>,
  <h1 key="index-3">Index 3</h1>,
] as const;

const SEQUENCE_INTERVAL_MS = 3000;

export function PlanToLiveGuidance() {
  const [activeStage, setActiveStage] = useState({ index: 0, cycle: 0 });
  const activeIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const activateStage = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveStage((current) => ({ index, cycle: current.cycle + 1 }));
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
      <p className="d3-plan-live-kicker">PRODUCT IN USE / PLAN TO LIVE GUIDANCE</p>
      <div className="d3-plan-live-top-rule" aria-hidden="true" />

      <div className="d3-plan-live-menu" aria-label="Product journey chapters">
        {sequence.map((stage, index) => (
          <button
            className={index === activeStage.index ? 'is-active' : ''}
            key={stage.number}
            type="button"
            aria-pressed={index === activeStage.index}
            onClick={() => selectStage(index)}
          >
            <b>{stage.number}</b>
            <span><strong>{stage.label}</strong><small>{stage.detail}</small></span>
          </button>
        ))}
      </div>

      <div className="d3-plan-live-stage" aria-live="polite">
        <div className="d3-plan-live-capture" key={`capture-${activeStage.index}`}>
          <span>{sequence[activeStage.index].number}</span>
          <strong>{sequence[activeStage.index].label}</strong>
          <small>{sequence[activeStage.index].capture}</small>
        </div>
      </div>

      <div className="d3-plan-live-editorial">
        <div className="d3-sequence-content" key={activeStage.index} aria-live="polite">
          {sequenceContent[activeStage.index]}
        </div>
        <h2 id="plan-live-title">YOUR PLAN.<br />YOUR COACH.<br />YOUR NEXT REP.</h2>
        <p className="d3-plan-live-body">Delirio keeps the daily plan, coach entry point, and live movement guidance inside one continuous experience—not three disconnected features.</p>
        <p className="d3-plan-live-archive">REAL DELIRIO PRODUCT CAPTURES / ARCHIVE 04.16.26</p>
        <div className="d3-plan-live-rule" aria-hidden="true" />
        <p className="d3-plan-live-note">The screens are shown as product evidence. Preserve their interface, proportions, and visual hierarchy in implementation.</p>
      </div>

      <div className="d3-experience-sequence" role="tablist" aria-label="Product experience sequence">
        {sequence.map((stage, index) => (
          <button
            className={index === activeStage.index ? 'is-active' : ''}
            key={stage.number}
            type="button"
            role="tab"
            aria-selected={index === activeStage.index}
            onClick={() => selectStage(index)}
          >
            <span className="d3-sequence-segment" aria-hidden="true">
              <i
                key={index === activeStage.index ? activeStage.cycle : stage.number}
                style={{ animationDuration: `${SEQUENCE_INTERVAL_MS}ms` }}
              />
            </span>
            <span className="d3-sequence-copy"><b>{stage.number}</b><span>{stage.label}</span></span>
          </button>
        ))}
      </div>
    </section>
  );
}
