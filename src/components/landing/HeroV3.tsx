import { ArrowUpRight } from 'lucide-react';
import heroImage from '../../assets/images/hero/supplied/park-dumbbell-curl/v1/image.jpg';
import heroText from '../../content/heroText.json';
import { HeroTypewriterWord } from './HeroTypewriterWord';

const content = heroText.heroTextV3;

/**
 * How the hero's single button is drawn. Both open the waitlist gate and both
 * now read `JOIN THE WAITLIST`; this picks the treatment, which is all that is
 * left of the difference between cells A and B.
 *
 * `label-first` keeps the historical `d3-hero-questionnaire-action` class — the
 * styling long outlived the quiz it was named for, and renaming it would churn
 * about twenty rules in `design3.css` for nothing.
 */
export type HeroV3Cta = 'label-first' | 'arrow-first';

/** V3 — focused adaptive-coaching promise without secondary tracking UI. */
export function HeroV3({
  onJoinWaitlist = () => undefined,
  cta = 'label-first',
}: {
  onJoinWaitlist?: () => void;
  cta?: HeroV3Cta;
}) {
  return <section className={`d3-hero d3-hero--v3 d3-hero--cta-${cta}`} aria-labelledby="hero-v3-title">
    <img className="d3-hero-image" src={heroImage} alt="" aria-hidden="true" />
    <div className="d3-hero-contrast" aria-hidden="true" />
    <div className="d3-hero-content">
      <div className="d3-hero-copy">
        <p className="d3-kicker">{content.kicker}</p>
        <h1 id="hero-v3-title">
          <span className="d3-visually-hidden">{content.heading.accessibleText}</span>
          <span aria-hidden="true">
            {content.heading.lines.map((line, index) => {
              const lineContent = 'animatedWords' in line && line.animatedWords
                ? <>{line.prefix}<HeroTypewriterWord words={line.animatedWords} /></>
                : line.text;
              return 'lead' in line && line.lead
                ? <span className="d3-hero-heading-line" key={`${line.lead}-${index}`}>
                    <span className="d3-hero-heading-lead">{line.lead}</span>
                    <span className="d3-hero-heading-copy">{lineContent}</span>
                  </span>
                : <span key={`line-${index}`}>{index > 0 && <br />}{lineContent}</span>;
            })}
          </span>
        </h1>
        <p className="d3-hero-support">{content.support}</p>
      </div>
      <div className="d3-hero-action-group">
        <p className="d3-hero-invitation">{content.invitation}</p>
        <div className="d3-hero-actions">
          {cta === 'arrow-first'
            ? <button className="d3-hero-action" type="button" onClick={onJoinWaitlist}>
                <span className="d3-hero-action-arrow" aria-hidden="true"><ArrowUpRight strokeWidth={3} /></span>
                <b className="d3-hero-action-label">{content.waitlistCta.label}</b>
              </button>
            : <button className="d3-hero-questionnaire-action" type="button" onClick={onJoinWaitlist}>
                <b className="d3-hero-questionnaire-label">{content.cta.label}</b>
                <span aria-hidden="true"><ArrowUpRight strokeWidth={3} /></span>
              </button>}
        </div>
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
