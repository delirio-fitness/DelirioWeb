import { AnimatedNumber } from '../AnimatedNumber';

const formatRestTime = (seconds: number) => `00:${String(seconds).padStart(2, '0')}`;

/**
 * Preserved Hero V3 workout scoreboard experiment.
 *
 * This component is intentionally not mounted in the production landing page.
 * Its existing class names remain styled in design3.css so it can be reused in
 * a future workout-focused section without reconstructing the visual.
 */
export function HeroWorkoutScoreboard() {
  return <aside className="d3-hero-scoreboard" aria-label="Live workout scoreboard">
    <div className="d3-hero-scoreboard__state"><span>LIVE WORKOUT</span><strong>SET <AnimatedNumber target={3} minimumDigits={2} /></strong><em>SESSION ACTIVE</em></div>
    <div className="d3-hero-scoreboard__form" aria-label="Form quality 94 percent"><span>FORM</span><strong><AnimatedNumber target={94} /><small>%</small></strong></div>
    <div aria-label="Calories burned 286 kilocalories"><span>CALORIES</span><strong><AnimatedNumber target={286} /><small>KCAL</small></strong></div>
    <div aria-label="Rest 42 seconds"><span>REST</span><strong><AnimatedNumber target={42} format={formatRestTime} /></strong></div>
  </aside>;
}
