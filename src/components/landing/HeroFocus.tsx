import heroImage from '../../assets/images/hero/supplied/park-dumbbell-curl/v1/image.jpg';
import heroText from '../../content/heroText.json';

const content = heroText.heroTextFocus;

/**
 * The shipped hero — cell B, and what an untagged visit gets: one centred column,
 * short copy, and a single oversized waitlist button. Nothing competes with the
 * signup — no quiz, no typewriter, no product screenshot. It was cell C of the
 * acquisition experiment, then cell B, and is now simply the page; `HeroV3`, the
 * explanatory hero it was drawn against, is the opt-in cell at `?v=a`.
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
