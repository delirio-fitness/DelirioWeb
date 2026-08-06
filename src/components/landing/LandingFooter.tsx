import { Link } from 'react-router-dom';
import { Logo } from '../logo';

/**
 * `onJoinWaitlist` is supplied on the landing page, where the gate can simply be
 * opened. The legal pages have no gate mounted, so they fall back to `/#wishlist`
 * — a hash `Landing` treats as "open the gate" rather than a scroll target.
 */
export function LandingFooter({
  sectionPrefix = '/',
  onJoinWaitlist,
}: {
  sectionPrefix?: '' | '/';
  onJoinWaitlist?: () => void;
}) {
  return (
    <footer className="d3-footer">
      <div className="d3-footer-feature">
        <div className="d3-footer-copy">
          <h2>YOUR COACH.<br />READY WHEN YOU ARE.</h2>
          <p>Delirio is opening in stages so every new coach gets the attention they signed up for. Join the waitlist and we will email you when your spot is ready.</p>
        </div>
        {/* The form itself lives behind the gate; a second one out here would
            split the signup between two records and skip the questions. */}
        <div className="d3-app-card">
          <div className="d3-app-copy">
            <small>iPhone</small>
            <b>EARLY ACCESS, ONE GROUP AT A TIME</b>
          </div>
          <div className="d3-app-download">
            <div className="d3-app-icon" aria-hidden="true">
              <Logo color="white" width="72" height="100" />
            </div>
            {onJoinWaitlist
              ? <button className="d3-footer-waitlist-cta" type="button" onClick={onJoinWaitlist}>JOIN THE WAITLIST</button>
              : <a className="d3-footer-waitlist-cta" href={`${sectionPrefix}#wishlist`}>JOIN THE WAITLIST</a>}
          </div>
        </div>
      </div>
      <div className="d3-footer-links">
        <FooterColumn sectionPrefix={sectionPrefix} title="Product" links={[['Plans', '#pricing'], ['Exercises', '#how-it-works'], ['Live coaching', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Coaches" links={[['Iris', '#coaches'], ['Reed', '#coaches'], ['Voice / Chat / SMS', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Info" links={[['About', '#product'], ['FAQ', '#faq'], ['Contact', 'mailto:contact@delirio.fit']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Follow" links={[['Instagram', 'https://www.instagram.com/delirio__official/'], ['YouTube', '#'], ['TikTok', 'https://www.tiktok.com/@delirio__official']]} />
      </div>
      <div className="d3-footer-bottom"><span>© 2026 DELIRIO</span><div><Link to="/support">Support</Link><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link><Link to="/data-deletion">Data deletion</Link></div></div>
    </footer>
  );
}

function FooterColumn({ sectionPrefix, title, links }: { sectionPrefix: '' | '/'; title: string; links: readonly (readonly [string, string])[] }) {
  return <div><h3>{title}</h3>{links.map(([label, href]) => <a key={label} href={href.startsWith('#') ? `${sectionPrefix}${href}` : href}>{label}</a>)}</div>;
}
