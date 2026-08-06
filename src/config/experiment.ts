/**
 * Landing page acquisition experiment.
 *
 * Meta ad sets point at `/?v=a`, `/?v=b`, `/?v=c`. Every cell renders the same
 * page body and differs only in the hero, so the hero treatment is the single
 * variable behind whatever the download rate does.
 *
 * The resolved cell is published on `window.delirioLandingVariant` and mirrored
 * onto `data-landing-variant` on the page root, so ad tracking added later can
 * segment conversions without re-deriving the assignment.
 */
export const LANDING_VARIANTS = ['a', 'b', 'c'] as const;

export type LandingVariant = (typeof LANDING_VARIANTS)[number];

/** Cell A is the untouched production hero, so an untagged visit is the control. */
export const DEFAULT_LANDING_VARIANT: LandingVariant = 'a';

export const LANDING_VARIANT_QUERY_PARAM = 'v';

const STORAGE_KEY = 'delirio:landing-variant';

export function isLandingVariant(value: unknown): value is LandingVariant {
  return typeof value === 'string' && (LANDING_VARIANTS as readonly string[]).includes(value);
}

function readStoredVariant(): LandingVariant | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return isLandingVariant(stored) ? stored : null;
  } catch {
    // Private-mode storage denial costs us the cell on internal navigation only.
    return null;
  }
}

function persistVariant(variant: LandingVariant): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, variant);
  } catch {
    // See readStoredVariant: an unavailable store is not worth failing a render.
  }
}

/**
 * Resolves the cell for this visit. An explicit `?v=` wins and is remembered for
 * the tab, so a visitor who reads the privacy policy and comes back to `/` stays
 * in the cell the ad sent them to instead of falling back to the control.
 */
export function resolveLandingVariant(search: string = window.location.search): LandingVariant {
  const requested = new URLSearchParams(search).get(LANDING_VARIANT_QUERY_PARAM);
  if (isLandingVariant(requested)) {
    persistVariant(requested);
    return requested;
  }
  return readStoredVariant() ?? DEFAULT_LANDING_VARIANT;
}

export function publishLandingVariant(variant: LandingVariant): void {
  window.delirioLandingVariant = variant;
}

declare global {
  interface Window {
    delirioLandingVariant?: LandingVariant;
  }
}
