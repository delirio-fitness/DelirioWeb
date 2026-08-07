/**
 * Landing page acquisition experiment.
 *
 * Meta ad sets point at `/?v=a` and `/?v=b`. Both cells render the same page
 * body and differ only in the hero, so the hero treatment is the single variable
 * behind whatever the waitlist signup rate does.
 *
 * - `a` — `HeroV3`: the standard hero, with one arrow-led `JOIN THE WAITLIST`.
 * - `b` — `HeroFocus`: a centred hero built around a single oversized button.
 *
 * ## The letters were reassigned, and old numbers do not carry over
 *
 * There used to be three cells. The original A and B were the same `HeroV3` with
 * the button drawn two ways, which made them a test of arrow placement rather
 * than of anything worth spending on; the clearer of the two survived and took
 * the letter A, and the old C became B.
 *
 * So **`landing_a` in Events Manager means one thing before that change and
 * another after**, and the old `landing_c` figures are this cell B. Anything
 * comparing across the change has to account for it — the cells were renamed,
 * not re-randomised, so the underlying populations are fine, but the labels lie.
 * A live ad still pointing at `?v=c` now falls through to the default cell A
 * rather than rendering the centred hero it was built for; repoint those URLs.
 *
 * The resolved cell is published on `window.delirioLandingVariant` and mirrored
 * onto `data-landing-variant` on the page root, so ad tracking can segment
 * conversions without re-deriving the assignment.
 */
export const LANDING_VARIANTS = ['a', 'b'] as const;

export type LandingVariant = (typeof LANDING_VARIANTS)[number];

/** Cell A is the standard hero, so an untagged visit is the control. */
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
