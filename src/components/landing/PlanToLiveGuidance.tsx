import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import workoutPlan from '../../images/appScreenshots/workoutPlan.png';
import clickStart from '../../images/appScreenshots/clickStart.png';
import inSession from '../../images/appScreenshots/see-the-rep/v4/image.png';
import midSetVoiceCoaching from '../../images/appScreenshots/midSetVoiceCoaching.png';
import coachIMessageThread from '../../images/appScreenshots/coachIMessageThread.png';
import postWorkoutText from '../../images/appScreenshots/postWorkoutText.png';
import startGenerated from '../../assets/images/planJourney/generated/start/v1/image.jpg';
import repGenerated from '../../assets/images/planJourney/generated/see-the-rep/v2/image.jpg';
import keepGoingGenerated from '../../assets/images/planJourney/generated/keep-going/v2/image.jpg';
import { PhoneScreenshotFrame } from './PhoneScreenshotFrame';
import { CoachCapabilityCollage } from './CoachCapabilityCollage';
import { Logo } from '../logo';

const sequence = [
  {
    number: '01', label: 'MEET YOUR COACH', detail: 'IRIS AND REED', capture: 'IRIS + REED + LIVE COACHING', image: midSetVoiceCoaching,
    v2Photo: { shape: 'square', src: keepGoingGenerated, alt: 'A woman checking in with her coach during a strength workout at home' },
    heading: ['AI COACHES THAT', 'LISTEN, RESPOND,', 'AND REMEMBER.'],
    body: 'Iris and Reed coach in different styles. Your coach responds to what you share, guides the next step, and remembers the context across your training.',
    coachCollage: true,
  },
  {
    number: '02', label: 'PLAN', detail: 'COACH BUILDS THE WEEK', capture: 'YOUR TRAINING PLAN', image: workoutPlan,
    heading: ['A PLAN BUILT FOR', 'THE WEEK YOU HAVE.'],
    body: 'Your coach builds around the time, energy, experience, and equipment you have now—not an ideal week you have to keep chasing.',
    quizCta: true,
  },
  {
    number: '03', label: 'START', detail: 'ENTER THE WORKOUT', capture: 'EXERCISES + SESSION START', image: clickStart,
    v2Photo: { shape: 'square', src: startGenerated, alt: 'A woman starting a strength workout at home' },
    heading: ['LESS DECIDING.', 'MORE STARTING.'],
    body: 'See what is planned and why, then start when you are ready—without another round of figuring out what to do.',
  },
  {
    number: '04', label: 'SEE THE REP', detail: 'COACH THE MOVEMENT', capture: 'LIVE REPS + REST', image: inSession,
    v2Photo: { shape: 'portrait', src: repGenerated, alt: 'A man performing a controlled goblet squat while following coaching at home' },
    heading: ['SEE WHAT THE', 'COACH NOTICED.'],
    body: 'Delirio tracks supported movement details, reps, and rest, then shows what changed and what to carry into your next set.',
  },
  {
    number: '05', label: 'PICK IT UP', detail: 'RETURN WITH CONTEXT', capture: 'IMESSAGE COACHING THREAD', image: coachIMessageThread, secondaryImage: postWorkoutText,
    heading: ['A MISSED WORKOUT.', 'NOT AN ABANDONED PLAN.'],
    body: 'Miss a workout without losing the plan. Return to saved context, pick up where you left off, and continue in the same coaching thread.',
    channelNote: 'You can now message your coach in Delirio or iMessage',
  },
] as const;

const SEQUENCE_INTERVAL_MS = 6000;

export function PlanToLiveGuidance({ onJoinWaitlist }: { onJoinWaitlist?: () => void }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressCycle, setProgressCycle] = useState(0);
  const activeIndexRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activateStage = useCallback((index: number) => {
    activeIndexRef.current = index;
    setActiveIndex(index);
    setProgressCycle((cycle) => cycle + 1);
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

  useEffect(() => {
    const menu = menuRef.current;
    if (!menu || window.innerWidth > 760 || typeof menu.scrollTo !== 'function') return;

    const activeButton = menu.querySelector<HTMLButtonElement>('.is-active');
    if (!activeButton) return;

    const centeredLeft = activeButton.offsetLeft - (menu.clientWidth - activeButton.clientWidth) / 2;
    menu.scrollTo({
      left: Math.max(0, centeredLeft),
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }, [activeIndex]);

  const activeStage = sequence[activeIndex];
  const activePhoto = 'v2Photo' in activeStage ? activeStage.v2Photo : undefined;
  const secondaryImage = 'secondaryImage' in activeStage ? activeStage.secondaryImage : undefined;
  const channelNote = 'channelNote' in activeStage ? activeStage.channelNote : undefined;
  const coachCollage = 'coachCollage' in activeStage && activeStage.coachCollage;
  const backgroundImage = activePhoto?.src ?? activeStage.image;

  return (
    <section
      id="how-it-works"
      className="d3-plan-live"
      data-theme="light"
      aria-labelledby="plan-live-title"
    >
      <div className="d3-plan-live-background" key={`background-${activeIndex}`} aria-hidden="true">
        <img src={backgroundImage} alt="" />
      </div>
      <div className="d3-plan-live-canvas">
        <div ref={menuRef} className="d3-plan-live-menu" aria-label="Product journey chapters">
          {sequence.map((stage, index) => (
            <button
              className={index === activeIndex ? 'is-active' : index < activeIndex ? 'is-complete' : ''}
              key={stage.number}
              type="button"
              aria-pressed={index === activeIndex}
              aria-current={index === activeIndex ? 'step' : undefined}
              data-progress-cycle={index === activeIndex ? progressCycle % 2 : undefined}
              style={{ '--sequence-duration': `${SEQUENCE_INTERVAL_MS}ms` } as CSSProperties}
              onClick={() => selectStage(index)}
            >
              <span><strong>{stage.label}</strong><small>{stage.detail}</small></span>
            </button>
          ))}
        </div>

        <div className="d3-plan-live-editorial">
          <div className="d3-sequence-content" key={activeIndex} aria-live="polite">
            <h2 id="plan-live-title">
              {activeStage.heading.map((line) => <span key={line}>{line}</span>)}
            </h2>
            <p className="d3-plan-live-body">{activeStage.body}</p>
            {'quizCta' in activeStage && activeStage.quizCta && (
              <div className="d3-plan-live-quiz">
                <button type="button" onClick={onJoinWaitlist}>JOIN THE WAITLIST</button>
                <small>See how Delirio can help you.</small>
              </div>
            )}
          </div>
        </div>

        <div className="d3-plan-live-stage" aria-live="polite">
          <div className={`d3-plan-live-capture${activePhoto ? ` d3-plan-live-capture--photo is-${activePhoto.shape}` : ''}${secondaryImage ? ' d3-plan-live-capture--channels' : ''}${coachCollage ? ' d3-plan-live-capture--coach-collage' : ''}`} key={`capture-${activeIndex}`}>
            {coachCollage ? (
              <CoachCapabilityCollage />
            ) : secondaryImage ? (
              <>
                <aside className="d3-plan-live-channel-note" aria-label="Delirio new feature notification">
                  <span className="d3-plan-live-notification-icon" aria-hidden="true">
                    <Logo color="black" width="18" height="25" />
                  </span>
                  <span className="d3-plan-live-notification-copy">
                    <span className="d3-plan-live-notification-meta">
                      <strong>Delirio</strong>
                      <time>NOW</time>
                    </span>
                    <b>New feature</b>
                    <span>{channelNote}</span>
                  </span>
                </aside>
                <div className="d3-plan-live-channel-phones">
                  <div className="d3-plan-live-channel-phone is-app">
                    <PhoneScreenshotFrame src={secondaryImage} alt="Delirio in-app conversation with Iris" />
                  </div>
                  <div className="d3-plan-live-channel-phone is-imessage">
                    <PhoneScreenshotFrame src={activeStage.image} alt="iMessage conversation with Iris" />
                  </div>
                </div>
              </>
            ) : activePhoto ? (
              <div className="d3-plan-live-photo-scene">
                <img className="d3-plan-live-photo" src={activePhoto.src} alt={activePhoto.alt} />
                <div className="d3-plan-live-screen-overlay">
                  <PhoneScreenshotFrame
                    src={activeStage.image}
                    alt={`${activeStage.label}: ${activeStage.capture} app screen`}
                  />
                </div>
              </div>
            ) : (
              <PhoneScreenshotFrame
                src={activeStage.image}
                alt={`${activeStage.label}: ${activeStage.capture}`}
              />
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
