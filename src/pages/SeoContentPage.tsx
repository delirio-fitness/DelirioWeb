import { Link, useLocation } from 'react-router-dom';
import { LandingLegalShell } from '../components/LandingLegalShell';
import { AppStoreLink } from '../components/landing/AppStoreLink';
import { getSeoPage } from '../content/seoPages';

export default function SeoContentPage() {
  const page = getSeoPage(useLocation().pathname);
  if (!page) return null;

  return (
    <LandingLegalShell>
      <article className="d3-seo-article">
        <p className="d3-kicker">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="d3-seo-article__lead">{page.introduction}</p>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </section>
        ))}
        <aside className="d3-seo-article__next-step">
          <h2>SEE WHETHER DELIRIO FITS YOUR TRAINING.</h2>
          <p>Explore the coaching experience, then decide whether to download the iOS app.</p>
          <AppStoreLink className="d3-hero-action">DOWNLOAD THE APP</AppStoreLink>
        </aside>
        <nav aria-label="Related Delirio guides" className="d3-seo-article__related">
          <h2>KEEP EXPLORING</h2>
          <Link to="/ai-fitness-coach">AI fitness coaching</Link>
          <Link to="/adaptive-workout-planner">Adaptive workout planning</Link>
          <Link to="/voice-workout-coach">Voice workout guidance</Link>
          <Link to="/workout-form-feedback">Workout form feedback</Link>
        </nav>
      </article>
    </LandingLegalShell>
  );
}
