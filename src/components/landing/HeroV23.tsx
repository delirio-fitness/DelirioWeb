import heroVideo from '../../assets/videos/hero-prototype.mp4';
import { HeroTacticalStrip } from './HeroTacticalStrip';

/** V2.3 — minimal tactical strip for peripheral live-session statistics. */
export function HeroV23() {
  return <section className="d3-hero d3-hero--v2 d3-hero--v23" aria-labelledby="hero-v23-title">
    <video className="d3-hero-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true"><source src={heroVideo} type="video/mp4" /></video>
    <div className="d3-hero-contrast" aria-hidden="true" />
    <HeroTacticalStrip />
    <div className="d3-hero-content">
      <div className="d3-hero-copy">
        <p className="d3-kicker">LIVE SESSION / ADAPTIVE COACHING</p>
        <h1 id="hero-v23-title">YOUR TRAINING.<br />ADAPTED<br />IN REAL TIME.</h1>
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
