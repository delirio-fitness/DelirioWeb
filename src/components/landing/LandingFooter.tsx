import { Link } from 'react-router-dom';
import { AppStoreBadge } from './AppStoreBadge';
import { Logo } from '../logo';

/**
 * `sectionPrefix` is `/` on the legal pages, where a bare `#pricing` would go
 * nowhere, and `''` on the landing page itself. The download slot needs no such
 * handling — it leaves the site entirely.
 */
export function LandingFooter({ sectionPrefix = '/' }: { sectionPrefix?: '' | '/' }) {
  return (
    <footer className="d3-footer">
      <div className="d3-footer-feature">
        <div className="d3-footer-copy">
          <h2>YOUR COACH.<br />READY WHEN YOU ARE.</h2>
          <p>Download Delirio on iPhone to plan, train, and follow up wherever your week takes you.</p>
        </div>
        <div className="d3-app-card">
          <div className="d3-app-copy">
            <small>iPhone</small>
            <b>DOWNLOAD NOW ON THE APP STORE</b>
          </div>
          <div className="d3-app-download">
            <div className="d3-app-icon" aria-hidden="true">
              <Logo color="white" width="72" height="100" />
            </div>
            <AppStoreBadge className="d3-footer-app-badge" />
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
