import { Link } from 'react-router-dom';
import { WishlistSignup } from './WishlistSignup';

export function LandingFooter({ sectionPrefix = '/' }: { sectionPrefix?: '' | '/' }) {
  return (
    <footer className="d3-footer">
      <WishlistSignup />
      <div className="d3-footer-links">
        <FooterColumn sectionPrefix={sectionPrefix} title="Product" links={[['Plans', '#pricing'], ['Exercises', '#how-it-works'], ['Live coaching', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Coaches" links={[['Iris', '#coaches'], ['Reed', '#coaches'], ['Voice / Chat / SMS', '#coaches']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Info" links={[['About', '#product'], ['FAQ', '#faq'], ['Contact', 'mailto:contact@delirio.fit']]} />
        <FooterColumn sectionPrefix={sectionPrefix} title="Follow" links={[['Instagram', 'https://www.instagram.com/delirio__official/'], ['YouTube', '#'], ['TikTok', 'https://www.tiktok.com/@delirio__official']]} />
      </div>
      <div className="d3-footer-bottom"><span>© 2026 DELIRIO</span><div><Link to="/privacy-policy">Privacy</Link><Link to="/terms-of-service">Terms</Link><Link to="/data-deletion">Data deletion</Link></div></div>
    </footer>
  );
}

function FooterColumn({ sectionPrefix, title, links }: { sectionPrefix: '' | '/'; title: string; links: readonly (readonly [string, string])[] }) {
  return <div><h3>{title}</h3>{links.map(([label, href]) => <a key={label} href={href.startsWith('#') ? `${sectionPrefix}${href}` : href}>{label}</a>)}</div>;
}
