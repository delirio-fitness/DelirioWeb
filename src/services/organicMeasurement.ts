/**
 * Organic acquisition measurement, intentionally separate from advertising.
 *
 * Clarity already records the site's privacy-safe session analytics. This file
 * adds just two pieces of context there: the acquisition channel for the visit
 * and a once-per-visit App Store handoff for organic-search visitors. It never
 * calls the Meta conversion endpoint or changes its payload.
 */

import { resolveAttribution, type Attribution } from '../utils/attribution';

export type AcquisitionChannel = 'paid_campaign' | 'organic_search' | 'referral' | 'direct_or_unknown';

const ORGANIC_HANDOFF_STORAGE_KEY = 'delirio:organic-search-store-handoff';

const SEARCH_ENGINES: ReadonlyArray<readonly [string, string]> = [
  ['google.com', 'google'],
  ['bing.com', 'bing'],
  ['duckduckgo.com', 'duckduckgo'],
  ['search.yahoo.', 'yahoo'],
  ['search.brave.com', 'brave'],
  ['ecosia.org', 'ecosia'],
];

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[] };
  }
}

function searchEngine(referrer?: string): string | undefined {
  if (!referrer) return undefined;

  try {
    const hostname = new URL(referrer).hostname.toLowerCase();
    if (/^(?:[a-z0-9-]+\.)*google\.[a-z.]+$/.test(hostname)) return 'google';
    return SEARCH_ENGINES.find(([domain]) => hostname === domain || hostname.endsWith(`.${domain}`))?.[1];
  } catch {
    return undefined;
  }
}

/** Identifies the source without passing the URL, campaign, or referrer to Clarity. */
export function classifyAcquisition(attribution: Attribution): AcquisitionChannel {
  if (attribution.source || attribution.medium || attribution.campaign || attribution.content || attribution.term || attribution.fbclid) {
    return 'paid_campaign';
  }

  if (searchEngine(attribution.referrer)) return 'organic_search';
  if (attribution.referrer) return 'referral';
  return 'direct_or_unknown';
}

/**
 * Attaches one coarse acquisition label to the Clarity session. Clarity's
 * queued API makes this safe even while its remote script is still loading.
 */
export function tagAcquisitionChannel(): AcquisitionChannel {
  const attribution = resolveAttribution();
  const channel = classifyAcquisition(attribution);
  const clarity = typeof window !== 'undefined' ? window.clarity : undefined;

  clarity?.('set', 'acquisition_channel', channel);
  const engine = searchEngine(attribution.referrer);
  if (channel === 'organic_search' && engine) {
    clarity?.('set', 'organic_search_engine', engine);
  }

  return channel;
}

/**
 * Records the site's terminal conversion for an organic-search visit. This is
 * an App Store handoff, not a claimed install; App Store installs remain
 * observable only inside app analytics.
 */
export function recordOrganicSearchStoreHandoff(): boolean {
  if (classifyAcquisition(resolveAttribution()) !== 'organic_search') return false;

  try {
    if (window.sessionStorage.getItem(ORGANIC_HANDOFF_STORAGE_KEY)) return false;
    window.sessionStorage.setItem(ORGANIC_HANDOFF_STORAGE_KEY, '1');
  } catch {
    // If storage is unavailable, retain the event rather than undercounting.
  }

  if (typeof window !== 'undefined') {
    window.clarity?.('event', 'organic_search_app_store_handoff');
  }
  return true;
}

/** Test seam: clears the per-visit handoff record. */
export function resetOrganicSearchStoreHandoff(): void {
  try {
    window.sessionStorage.removeItem(ORGANIC_HANDOFF_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}
