import heroVideo from '../../assets/videos/hero-prototype.mp4';
import { AnimatedNumber } from './AnimatedNumber';

const formatRestTime = (seconds: number) => `00:${String(seconds).padStart(2, '0')}`;

/** V3 — live workout scoreboard staged as a broadcast lower-third. */
export function HeroV3() {
  return <section className="d3-hero d3-hero--v3" aria-labelledby="hero-v3-title">
    <video className="d3-hero-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true"><source src={heroVideo} type="video/mp4" /></video>
    <div className="d3-hero-contrast" aria-hidden="true" />
    <aside className="d3-hero-scoreboard" aria-label="Live workout scoreboard">
      <div className="d3-hero-scoreboard__state"><span>LIVE WORKOUT</span><strong>SET <AnimatedNumber target={3} minimumDigits={2} /></strong><em>SESSION ACTIVE</em></div>
      <div className="d3-hero-scoreboard__form" aria-label="Form quality 94 percent"><span>FORM</span><strong><AnimatedNumber target={94} /><small>%</small></strong></div>
      <div aria-label="Calories burned 286 kilocalories"><span>CALORIES</span><strong><AnimatedNumber target={286} /><small>KCAL</small></strong></div>
      <div aria-label="Rest 42 seconds"><span>REST</span><strong><AnimatedNumber target={42} format={formatRestTime} /></strong></div>
    </aside>
    <div className="d3-hero-content">
      <div className="d3-hero-copy">
        <p className="d3-kicker">LIVE SESSION / ADAPTIVE COACHING</p>
        <h1 id="hero-v3-title">YOUR TRAINING.<br />ADAPTED IN REAL TIME.</h1>
        <p className="d3-hero-support">One coach notices the work as it happens—and remembers what should change next.</p>
      </div>
      <div className="d3-hero-action-group">
        <p className="d3-hero-invitation">MEET THE COACH WHO TRAINS WITH CONTEXT</p>
        <a className="d3-hero-action" href="#coaches"><span aria-hidden="true">→</span> SEE COACHES</a>
        <p className="d3-hero-capabilities">FORM / REPS / REST / SESSION MEMORY</p>
      </div>
    </div>
  </section>;
}
