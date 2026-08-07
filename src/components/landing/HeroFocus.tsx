import heroImage from '../../assets/images/hero/supplied/park-dumbbell-curl/v1/image.jpg';
import heroText from '../../content/heroText.json';

const content = heroText.heroTextFocus;

/**
 * Cell C of the acquisition experiment: one centred column, short copy, and a
 * single oversized waitlist button. Nothing competes with the signup — no quiz,
 * no typewriter, no product screenshot — so the hero tests whether a plainer,
 * louder ask converts ad traffic better than the explanatory default.
 */
export function HeroFocus({ onJoinWaitlist }: { onJoinWaitlist?: () => void }) {
  return (
    <section className="d3-hero d3-hero--focus" aria-labelledby="hero-focus-title">
      <img className="d3-hero-image" src={heroImage} alt="" aria-hidden="true" />
      <div className="d3-hero-focus-scrim" aria-hidden="true" />
      <div className="d3-hero-focus-content">
        <p className="d3-hero-focus-capabilities">{content.capabilities}</p>
        <h1 id="hero-focus-title">
          <span className="d3-visually-hidden">{content.heading.accessibleText}</span>
          <span aria-hidden="true">
            {content.heading.lines.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </span>
        </h1>
        <p className="d3-hero-focus-support">{content.support}</p>
        <button className="d3-hero-focus-action" type="button" onClick={onJoinWaitlist}>
          {content.cta.label}
        </button>
        <p className="d3-hero-focus-reassurance">{content.reassurance}</p>
      </div>
    </section>
  );
}
