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
 * `variant` is the live ad experiment cell (see `config/experiment`): B is
 * `HeroFocus` and is what an untagged visit gets, A is the standard hero and is
 * opt-in. Both offer a single `DOWNLOAD THE APP` pointing at the same place, so
 * the layout is the only thing varying.
 *
 * `HeroFocus` is the terminal branch rather than a named case, so anything that
 * is not a pinned composition or an explicit cell A lands on the shipped hero.
 *
 * A third cell once split A into two button treatments. It is gone, along with
 * the `label-first` rendering it existed to show — see `config/experiment` for
 * why, and note that the letters shifted with it.
 *
 * `?hero=v*` still selects a saved composition for design review and takes
 * precedence, so a reviewer can pin a hero regardless of which cell they are in.
 */
export function HeroExperiment({ variant = DEFAULT_LANDING_VARIANT }: { variant?: LandingVariant }) {
  const composition = readRequestedComposition();
  if (composition === 'v1') return <HeroV1 />;
  if (composition === 'v2.3') return <HeroV23 />;
  if (composition === 'v3' || variant === 'a') return <HeroV3 />;
  return <HeroFocus />;
}
