import { DEFAULT_LANDING_VARIANT, type LandingVariant } from '../../config/experiment';
import { HeroFocus } from './HeroFocus';
import { HeroV1 } from './HeroV1';
import { HeroV23 } from './HeroV23';
import { HeroV3 } from './HeroV3';

type HeroComposition = 'v1' | 'v2.3' | 'v3';

function readRequestedComposition(): HeroComposition | null {
  const requested = new URLSearchParams(window.location.search).get('hero');
  if (requested === 'v2') return 'v2.3';
  if (requested === 'v1' || requested === 'v2.3' || requested === 'v3') return requested;
  return null;
}

/**
 * Picks the hero for this visit.
 *
 * `variant` is the live ad experiment cell (see `config/experiment`): B replaces
 * the hero outright with `HeroFocus`, A gets the standard one. Both offer a
 * single `JOIN THE WAITLIST` and open the same gate, so the layout is the only
 * thing varying.
 *
 * A third cell once split A into two button treatments. It is gone, along with
 * the `label-first` rendering it existed to show — see `config/experiment` for
 * why, and note that the letters shifted with it.
 *
 * `?hero=v*` still selects a saved composition for design review and takes
 * precedence, so a reviewer can pin a hero regardless of which cell they are in.
 */
export function HeroExperiment({
  variant = DEFAULT_LANDING_VARIANT,
  onJoinWaitlist,
}: {
  variant?: LandingVariant;
  onJoinWaitlist?: () => void;
}) {
  const composition = readRequestedComposition();
  if (composition === 'v1') return <HeroV1 />;
  if (composition === 'v2.3') return <HeroV23 />;
  if (composition === null && variant === 'b') return <HeroFocus onJoinWaitlist={onJoinWaitlist} />;
  return <HeroV3 onJoinWaitlist={onJoinWaitlist} />;
}
