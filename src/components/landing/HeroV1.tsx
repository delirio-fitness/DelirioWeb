import heroVideo from '../../assets/videos/hero-prototype.mp4';

/** Current production hero: editorial and CTA follow one compact left-hand path. */
export function HeroV1() {
  return <section className="d3-hero d3-hero--v1" aria-labelledby="hero-title">
    <video className="d3-hero-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true"><source src={heroVideo} type="video/mp4" /></video>
    <div className="d3-hero-contrast" aria-hidden="true" />
    <div className="d3-hero-content">
      <div className="d3-hero-copy">
        <p className="d3-kicker">LIVE SESSION / ADAPTIVE COACHING</p>
        <h1 id="hero-title">YOUR TRAINING.<br />ADAPTED IN REAL TIME.</h1>
        <p className="d3-hero-support">One coach notices the work as it happens—and remembers what should change next.</p>
      </div>
      <div className="d3-hero-action-group">
        <a className="d3-hero-action" href="#coaches">SEE COACHES <span aria-hidden="true">→</span></a>
        <p className="d3-hero-capabilities">FORM / REPS / REST / SESSION MEMORY</p>
      </div>
    </div>
  </section>;
}
