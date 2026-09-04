import { ArrowUpRight } from 'lucide-react';
import heroImage from '../../assets/images/hero/supplied/park-dumbbell-curl/v1/image.jpg';
import heroText from '../../content/heroText.json';
import { AppStoreLink } from './AppStoreLink';
import { HeroTypewriterWord } from './HeroTypewriterWord';

const content = heroText.heroTextV3;

/**
 * V3 — focused adaptive-coaching promise without secondary tracking UI.
 *
 * The button was once switchable between two treatments, `arrow-first` and
 * `label-first`, because cells A and B of the ad experiment differed by nothing
 * else. That turned out to be a test of arrow placement rather than of anything
 * worth spending on; `arrow-first` won, the `cta` prop went, and the
 * `d3-hero-questionnaire-action` markup and styling went with it. Recoverable
 * from git if the treatment is ever worth revisiting.
 */
export function HeroV3() {
  return <section className="d3-hero d3-hero--v3 d3-hero--cta-arrow-first" aria-labelledby="hero-v3-title">
    <img className="d3-hero-image" src={heroImage} alt="" aria-hidden="true" decoding="sync" fetchPriority="high" />
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
          <AppStoreLink className="d3-hero-action">
            <span className="d3-hero-action-arrow" aria-hidden="true"><ArrowUpRight strokeWidth={3} /></span>
            <b className="d3-hero-action-label">{content.downloadCta.label}</b>
          </AppStoreLink>
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
