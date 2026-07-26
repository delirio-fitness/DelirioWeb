import { AnimatedNumber } from './AnimatedNumber';

const formatRestTime = (seconds: number) => `00:${String(seconds).padStart(2, '0')}`;

/** Minimal live-session strip: one datum line, three readings, no enclosing card. */
export function HeroTacticalStrip() {
  return <aside className="d3-hero-tactical" aria-label="Live workout tactical strip">
    <div aria-label="Form quality 94 percent"><span>FORM QUALITY</span><strong><AnimatedNumber target={94} /><small>%</small></strong></div>
    <div aria-label="Calories burned 286 kilocalories"><span>CALORIES BURNED</span><strong><AnimatedNumber target={286} /><small>KCAL</small></strong></div>
    <div aria-label="Rest 42 seconds"><span>REST</span><strong><AnimatedNumber target={42} format={formatRestTime} /></strong></div>
  </aside>;
}
