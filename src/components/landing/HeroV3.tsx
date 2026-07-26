import heroImage from '../../assets/images/7200586.jpg';
import heroText from '../../content/heroText.json';
import { HeroTypewriterWord } from './HeroTypewriterWord';

const content = heroText.heroTextV2;

/** V3 — focused adaptive-coaching promise without secondary tracking UI. */
export function HeroV3() {
  return <section className="d3-hero d3-hero--v3" aria-labelledby="hero-v3-title">
    <img className="d3-hero-image" src={heroImage} alt="" aria-hidden="true" />
    <div className="d3-hero-contrast" aria-hidden="true" />
    <div className="d3-hero-content">
      <div className="d3-hero-copy">
        <p className="d3-kicker">{content.kicker}</p>
        <h1 id="hero-v3-title">
          <span className="d3-visually-hidden">{content.heading.accessibleText}</span>
          <span aria-hidden="true">
            {content.heading.lines.map((line, index) => <span key={'text' in line ? line.text : line.prefix}>
              {index > 0 && <br />}
              {'animatedWords' in line && line.animatedWords
                ? <>{line.prefix}<HeroTypewriterWord words={line.animatedWords} /></>
                : line.text}
            </span>)}
          </span>
        </h1>
        <p className="d3-hero-support">{content.support}</p>
      </div>
      <div className="d3-hero-action-group">
        <p className="d3-hero-invitation">{content.invitation}</p>
        <a className="d3-hero-action" href={content.cta.href}>
          <span className="d3-hero-action-arrow" aria-hidden="true">{content.cta.icon}</span>
          <b className="d3-hero-action-label">{content.cta.label}</b>
        </a>
        <p className="d3-hero-capabilities">{content.capabilities}</p>
      </div>
    </div>
    <p className="d3-hero-coaching-signal" aria-label={content.coachingSignal.ariaLabel}>
      <span aria-hidden="true" />
      <small>{content.coachingSignal.eyebrow}</small>
      <strong>{content.coachingSignal.message}</strong>
    </p>
  </section>;
}
