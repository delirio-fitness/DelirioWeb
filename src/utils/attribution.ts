/**
 * First-touch ad attribution for the visit.
 *
 * Resolved once on the first page of a visit and held for the tab. A conversion
 * fires minutes after the landing — after the visitor has read the privacy
 * policy and come back, or after react-router has dropped the query string — so
 * reading the campaign off the URL at conversion time would report nothing for
 * exactly the visits an ad paid for. This mirrors how `config/experiment` holds
 * the cell assignment, and for the same reason.
 */

export type Attribution = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  referrer?: string;
  /**
   * When this envelope was captured, in epoch milliseconds.
   *
   * Stands in for the ad click time when the server builds Meta's `fbc`. The
   * first page of the visit is the closest thing to the click we can observe,
   * and it beats the alternative — stamping the conversion instead, which for a
   * visitor who reads the page first can be minutes off.
   */
  capturedAt?: number;
};

const STORAGE_KEY = 'delirio:attribution';

/** Long enough for real campaign names, short enough that a junk URL cannot bloat every event. */
const MAX_VALUE_LENGTH = 200;

/** Every field that comes off the URL as text. `capturedAt` is stamped, not read. */
type AttributionTextField = Exclude<keyof Attribution, 'capturedAt'>;

const QUERY_FIELDS = [
  ['utm_source', 'source'],
  ['utm_medium', 'medium'],
  ['utm_campaign', 'campaign'],
  ['utm_content', 'content'],
  ['utm_term', 'term'],
  ['fbclid', 'fbclid'],
] as const satisfies readonly (readonly [string, AttributionTextField])[];

function clean(value: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim().slice(0, MAX_VALUE_LENGTH);
  return trimmed.length > 0 ? trimmed : undefined;
}

function readStored(): Attribution | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: unknown = JSON.parse(stored);
    return parsed !== null && typeof parsed === 'object' ? (parsed as Attribution) : null;
  } catch {
    // Private-mode denial or a hand-edited value: fall through and re-derive.
    return null;
  }
}

function persist(attribution: Attribution): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // See readStored — an unavailable store degrades attribution, not the page.
  }
}

function derive(search: string, referrer: string): Attribution {
  const params = new URLSearchParams(search);
  const attribution: Attribution = { capturedAt: Date.now() };
  for (const [param, field] of QUERY_FIELDS) {
    const value = clean(params.get(param));
    if (value) attribution[field] = value;
  }

  // Only useful when it is not our own domain bouncing the visitor around.
  const referrerValue = clean(referrer);
  if (referrerValue && !referrerValue.includes(window.location.host)) {
    attribution.referrer = referrerValue;
  }

  return attribution;
}

/**
 * Returns the attribution for this visit, capturing it on first call.
 *
 * First touch wins: a later call never overwrites a stored envelope, so an
 * internal navigation that arrives with no parameters cannot erase the campaign
 * the visitor actually came from.
 */
export function resolveAttribution(
  search: string = window.location.search,
  referrer: string = document.referrer,
): Attribution {
  const stored = readStored();
  if (stored) return stored;

  const attribution = derive(search, referrer);
  persist(attribution);
  return attribution;
}
