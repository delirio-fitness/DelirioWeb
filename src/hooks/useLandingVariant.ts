import { useEffect, useState } from 'react';
import { publishLandingVariant, resolveLandingVariant, type LandingVariant } from '../config/experiment';

/**
 * Resolves the ad experiment cell once per mount. Holding it in state keeps the
 * visitor in the cell they landed in for the whole visit, even though the hero
 * reads it on every render.
 */
export function useLandingVariant(): LandingVariant {
  const [variant] = useState(resolveLandingVariant);

  useEffect(() => {
    publishLandingVariant(variant);
  }, [variant]);

  return variant;
}
