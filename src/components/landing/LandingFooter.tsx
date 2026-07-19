import { Link } from 'react-router-dom';
import { APP_STORE_URL } from '../../config/product';
import appStoreBadge from '../../images/appleOfficialBadges/Mobile app store badge.svg';
import { Logo } from '../logo';

export function LandingFooter({ sectionPrefix = '/' }: { sectionPrefix?: '' | '/' }) {
  return (
    <footer className="d3-footer">
      <div className="d3-footer-feature">
        <div className="d3-footer-copy"><small>JUST RELEASED / IOS</small><h2>THE COACHES NOW<br />IN YOUR POCKET.</h2><p>Delirio is now available on iPhone. Train, talk, and adapt wherever the work happens.</p></div>
        <div className="d3-app-card">
          <div className="d3-app-icon"><Logo color="white" width="72" height="100" /></div>
          <a className="d3-app-badge" href={APP_STORE_URL} target="_blank" rel="noreferrer"><img src={appStoreBadge} alt="Download on the App Store" /></a>
          <div className="d3-app-copy"><small>Version 1.0 · Free Download · iPhone</small><b>NOW AVAILABLE ON THE APP STORE</b></div>
        </div>
      </div>
      <div className="d3-footer-links">
        <FooterColumn sectionPrefix={sectionPrefix} title="Product" links={[['Plans', '#pricing'], ['Exercises', '#how-it-works'], ['Live coaching', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Coaches" links={[['Iris', '#coaches'], ['Reed', '#coaches'], ['Voice / Chat / SMS', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Info" links={[['About', '#product'], ['FAQ', '#faq'], ['Contact', 'mailto:contact@delirio.fit']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Follow" links={[['Instagram', 'https://www.instagram.com/delirio__official/'], ['YouTube', '#'], ['TikTok', 'https://www.tiktok.com/@delirio__official']]} />
      </div>
      <div className="d3-footer-bottom"><span>© 2026 DELIRIO</span><div><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link><Link to="/data-deletion">Accessibility</Link></div></div>
    </footer>
  );
}

function FooterColumn({ sectionPrefix, title, links }: { sectionPrefix: '' | '/'; title: string; links: readonly (readonly [string, string])[] }) {
  return <div><h3>{title}</h3>{links.map(([label, href]) => <a key={label} href={href.startsWith('#') ? `${sectionPrefix}${href}` : href}>{label}</a>)}</div>;
}
