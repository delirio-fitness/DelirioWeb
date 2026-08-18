/**
 * What Delirio reports as a conversion, and why so little of it happens here.
 *
 * The app is on the App Store, so acquisition is a handoff: the site's job is to
 * explain the product and send people to `/app`. That makes the download click
 * the only action on the site worth reporting, and it reports one standard
 * `Lead` with the trigger riding along as a parameter.
 *
 * Two rules shape which actions qualify:
 *
 * 1. The action has to cost the visitor something. Scroll depth and section
 *    views are absent because they would buy volume by diluting the signal the
 *    event exists to carry.
 *
 * 2. **No conversion may fire at or after a question about the visitor.** There
 *    is nothing on the site that asks one today — the waitlist gate and its six
 *    questions are gone — so nothing currently tests this. It is written down
 *    because it is not a fact about the old questions: an event that fires only
 *    for people who answered something about their health discloses it through
 *    its *timing*, whatever the payload carries and whatever the event is named,
 *    which is the GoodRx/BetterHelp fact pattern. Anything that asks the visitor
 *    about themselves again — an onboarding quiz, a "which coach suits you"
 *    picker — inherits this rule from the moment it is added.
 *
 * `recordPageView` at the bottom is the exception that proves rule 1: a page load
 * costs the visitor nothing, so it is deliberately *not* a qualified action and
 * does not go through `recordQualifiedAction` or its storage. It exists to give
 * Meta the visitors who never convert, which is most of what the optimizer needs
 * and all of what it currently lacks. Read its comment before touching the
 * bookkeeping — the two paths are separate for a reason that is easy to undo.
 *
 * The transport is `conversionBeacon` → `netlify/functions/conversion.mts`. There
 * is no Meta pixel in the page; what a trigger is worth and what Meta calls it
 * both live on the server.
 */

import { resolveLandingVariant } from '../config/experiment';
import { resolveAttribution } from '../utils/attribution';
import { createClientId } from '../utils/createClientId';
import { sendConversion } from './conversionBeacon';

/**
 * Boots ad tracking for the visit.
 *
 * Only captures attribution now — there is no third-party script left to load.
 * It still has to run before render, because an internal `Link` drops the query
 * string and there is no recovering the campaign after that.
 */
export function initAdTracking(): void {
  resolveAttribution();
}

/**
 * `store_click` — the visitor chose to go to the App Store. Fired from
 * `AppStoreLink`, which every download CTA on the site renders through, so a new
 * store link cannot be added without reporting. Reported to Meta as `Lead`.
 *
 * It is the only member of this union, and that is the shape to keep: the site
 * hands off to the App Store and the install itself is reported by the Meta SDK
 * inside the app, which is where the deeper funnel now lives. A second trigger
 * here would need a reason beyond "we could measure it".
 */
export type QualifyingTrigger = 'store_click';

const FIRED_STORAGE_KEY = 'delirio:qualified-actions';

function readFired(): string[] {
  try {
    const stored = window.sessionStorage.getItem(FIRED_STORAGE_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === 'string') : [];
  } catch {
    return [];
  }
}

function persistFired(fired: string[]): void {
  try {
    window.sessionStorage.setItem(FIRED_STORAGE_KEY, JSON.stringify(fired));
  } catch {
    // Storage denial means a visitor can report a trigger twice. Preferable to
    // dropping the conversion outright, which would understate the campaign.
  }
}

/**
 * Reports a qualified action, at most once per trigger per visit.
 *
 * The first qualifying action of a visit is flagged, and the server reports the
 * standard `Lead` only for that one — so `Lead` counts qualified *visitors*
 * rather than actions. With one trigger in the union that flag is always true;
 * it is kept because it is what makes adding a second trigger safe rather than
 * something that quietly doubles the `Lead` count.
 *
 * Returns whether anything was reported, so callers can avoid duplicate work.
 */
export function recordQualifiedAction(trigger: QualifyingTrigger): boolean {
  const fired = readFired();
  if (fired.includes(trigger)) return false;

  const isFirstOfVisit = fired.length === 0;
  persistFired([...fired, trigger]);

  sendConversion({
    trigger,
    // One ID per action, shared by both events Meta receives and reusable as the
    // dedup key if the same action is ever reported twice.
    eventId: createClientId(),
    variant: resolveLandingVariant(),
    firstOfVisit: isFirstOfVisit,
    attribution: resolveAttribution(),
  });

  return true;
}

/** Test seam: clears the per-visit dedup record. */
export function resetQualifiedActions(): void {
  try {
    window.sessionStorage.removeItem(FIRED_STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}

/**
 * Kept apart from `FIRED_STORAGE_KEY` on purpose — see `recordPageView`.
 */
const PAGE_VIEW_STORAGE_KEY = 'delirio:page-view';

/**
 * The landing was seen. Reported to Meta as `PageView`.
 *
 * **This is not a qualified action, and it must never be recorded as one.** Rule
 * 1 above is that a reportable action costs the visitor something; a page load
 * costs nothing. It is here as model input rather than as something an ad set
 * could be pointed at — see the trigger table in `netlify/functions/conversion`.
 *
 * ## Why it keeps its own key
 *
 * `FIRED_STORAGE_KEY` is not just a dedup record — its *length* is what decides
 * `firstOfVisit`, and the server sends the standard `Lead` only when that is
 * true. A page view lands before every CTA by definition, so putting it in that
 * array would make `fired.length === 0` false at the moment `store_click` fires,
 * and **`Lead` would silently never be reported again**: Events Manager would
 * show the custom twin climbing and the optimizable event flat at zero, with
 * nothing anywhere saying why. Hence a separate key, and hence
 * `firstOfVisit: false` below — a page view never claims the visit's first
 * effortful action, because it is not one.
 *
 * Fires on `/` only. The legal pages are not ad destinations and report nothing.
 */
export function recordPageView(): boolean {
  try {
    if (window.sessionStorage.getItem(PAGE_VIEW_STORAGE_KEY)) return false;
    window.sessionStorage.setItem(PAGE_VIEW_STORAGE_KEY, '1');
  } catch {
    // Same trade as persistFired: an unavailable store may report a second page
    // view, which overstates a campaign far less than dropping it understates one.
  }

  sendConversion({
    trigger: 'page_view',
    eventId: createClientId(),
    variant: resolveLandingVariant(),
    // Never true. See above — this is the whole reason for the separate key.
    firstOfVisit: false,
    attribution: resolveAttribution(),
  });

  return true;
}

/** Test seam: clears the per-visit page-view record. */
export function resetPageView(): void {
  try {
    window.sessionStorage.removeItem(PAGE_VIEW_STORAGE_KEY);
  } catch {
    // Nothing to clear if storage is unavailable.
  }
}
