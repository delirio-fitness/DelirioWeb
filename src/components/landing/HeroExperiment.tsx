import { HeroV1 } from './HeroV1';
import { HeroV23 } from './HeroV23';
import { HeroV3 } from './HeroV3';

type HeroVariant = 'v1' | 'v2.3' | 'v3';

/**
 * Selects a saved hero composition for visual review. V3 is the current
 * production default; append a saved `?hero=v*` value to compare alternatives.
 */
export function HeroExperiment({ onTakeQuiz }: { onTakeQuiz?: () => void }) {
  const requestedVariant = new URLSearchParams(window.location.search).get('hero');
  const variant: HeroVariant = requestedVariant === 'v2'
    ? 'v2.3'
    : requestedVariant === 'v1' || requestedVariant === 'v2.3'
      ? requestedVariant
      : 'v3';
  if (variant === 'v1') return <HeroV1 />;
  if (variant === 'v2.3') return <HeroV23 />;
  return <HeroV3 onTakeQuiz={onTakeQuiz} />;
}
