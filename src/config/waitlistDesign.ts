/**
 * Which waitlist gate the visitor sees.
 *
 * Both designs ask the same questions and write the same record; they differ
 * only in how the questions are presented, so whichever one converts better is
 * a statement about the presentation rather than the content.
 *
 * - `steps`  — one question per screen, advancing on selection, waitlist last.
 * - `single` — every question on one card, with the email revealed at the end.
 *
 * Selected with `?wl=`, remembered for the tab like the landing cell is, and
 * reported alongside the conversion so a signup can be traced back to the
 * design that produced it.
 */
export const WAITLIST_DESIGNS = ['steps', 'single'] as const;

export type WaitlistDesign = (typeof WAITLIST_DESIGNS)[number];

/** The stepped flow is the shape the page already had, so it is the baseline. */
export const DEFAULT_WAITLIST_DESIGN: WaitlistDesign = 'steps';

export const WAITLIST_DESIGN_QUERY_PARAM = 'wl';

const STORAGE_KEY = 'delirio:waitlist-design';

export function isWaitlistDesign(value: unknown): value is WaitlistDesign {
  return typeof value === 'string' && (WAITLIST_DESIGNS as readonly string[]).includes(value);
}

function readStoredDesign(): WaitlistDesign | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return isWaitlistDesign(stored) ? stored : null;
  } catch {
    // Private-mode storage denial costs us the design on internal navigation only.
    return null;
  }
}

function persistDesign(design: WaitlistDesign): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, design);
  } catch {
    // See readStoredDesign: an unavailable store is not worth failing a render.
  }
}

/**
 * Resolves the design for this visit. An explicit `?wl=` wins and is remembered
 * for the tab, so opening the gate a second time — or coming back from the
 * privacy policy — does not silently switch designs mid-review.
 */
export function resolveWaitlistDesign(search: string = window.location.search): WaitlistDesign {
  const requested = new URLSearchParams(search).get(WAITLIST_DESIGN_QUERY_PARAM);
  if (isWaitlistDesign(requested)) {
    persistDesign(requested);
    return requested;
  }
  return readStoredDesign() ?? DEFAULT_WAITLIST_DESIGN;
}
