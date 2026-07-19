import { Link } from 'react-router-dom';
import { Logo } from '../logo';

const navItems = [
  ['Product', 'product'],
  ['How it works', 'how-it-works'],
  ['Coaches', 'coaches'],
  ['Pricing', 'pricing'],
] as const;

export function LandingHeader({ sectionPrefix = '' }: { sectionPrefix?: '' | '/' }) {
  return (
    <>
      <a className="d3-skip" href={`${sectionPrefix}#main-content`}>
        Skip to main content
      </a>
      <header className="d3-legal-header">
        <Link className="d3-logo" to="/" aria-label="Delirio home"><Logo color="white" width="22" height="31" /></Link>
        <nav className="d3-legal-nav" aria-label="Primary navigation">
          {navItems.map(([label, id]) => (
            <a key={id} href={`${sectionPrefix}#${id}`}>{label}</a>
          ))}
        </nav>
        <a className="d3-header-cta" href={`${sectionPrefix}#coaches`}>Start training</a>
      </header>
    </>
  );
}
