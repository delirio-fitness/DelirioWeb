/**
 * What Delirio reports as a conversion, and why so little of it happens here.
 *
 * The site cannot optimize for downloads while the app update is in review, so
 * acquisition runs through the waitlist. No single website action is both
 * high-intent and frequent enough to optimize on alone — an ad set needs roughly
 * 50 conversions a week to leave the learning phase — so every qualifying action
 * reports one standard `Lead` and the trigger rides along as a parameter.
 *
 * Two rules shape which actions qualify, and the second one is not negotiable:
 *
 * 1. The action has to cost the visitor something. Scroll depth, section views,
 *    and the questionnaire auto-opening are absent because they would buy volume
 *    by diluting the signal the event exists to carry.
 *
 * 2. **The action has to happen before the waitlist questions.** They ask about
 *    weight-loss progress and what someone wants from a training plan
 *    (`content/waitlistQuestions.ts`). An event that fires only for people who
 *    answered them tells Meta something about their health through its timing
 *    alone — the payload does not need to contain the answer, and renaming the
 *    event does not help, because the correlation is the disclosure. Both
 *    triggers below sit upstream of the first question, and nothing downstream
 *    of it may be added.
 *
 *    The email box is the case that makes this concrete, because the same
 *    component sits on both sides of the line depending on the arm
 *    (`config/waitlistOrder`). Email-first shows it as the gate's opening
 *    screen, with no question seen, so its submit reports. Questions-first
 *    unlocks it only once all six answers are given, so its submit is silent —
 *    permanently, and not as a setting anybody may flip. `WishlistSignup` takes
 *    that as a prop for exactly this reason: the position licenses the event.
 *
 *    **This rule does not loosen when the questions do.** It held when the third
 *    question asked about GLP-1 titration stage; it still holds now that the set
 *    avoids describing anyone's body at all. It governs where an event fires,
 *    not how sensitive this month's wording happens to be — which is the whole
 *    reason it survives rewrites of the question bank.
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
 * `waitlist_started` — the visitor chose to open the waitlist gate. Fired from
 * the CTA path in `Landing.tsx`, never from the auto-open, because being shown
 * something after 30 seconds is not an action. Reported to Meta as `Lead`.
 *
 * `email_submitted` — an address given before any question was shown: the
 * email-first arm's opening screen, or the standalone band, which asks nothing.
 * Reported as `CompleteRegistration`, so Ads Manager can tell which creative
 * brings people who finish apart from which brings people who click. The
 * questions-first closing screen does not report — it sits behind all six
 * answers.
 *
 * Note that a visit normally sends both, in that order, and that the second one
 * does *not* help an ad set leave the learning phase: a set counts only the
 * event it optimizes on. See the trigger table in `netlify/functions/conversion`.
 */
export type QualifyingTrigger = 'waitlist_started' | 'email_submitted';

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
 * rather than actions. One person doing two effortful things is one conversion,
 * which is what keeps the optimizer's picture of a converter honest.
 *
 * Returns whether anything was reported, so callers can avoid duplicate work.
 */
export function recordQualifiedAction(trigger: 'waitlist_started'): boolean;
/**
 * The address is optional and may be given **only here**.
 *
 * It raises Meta's match quality for the visitors `fbc` cannot reach — a
 * stripped `fbclid`, a conversion on a different device than the click, a
 * view-through. Meta joins it against its own hash of the same address, so it
 * works with no cookie and no click.
 *
 * Passing it is not the same as it being sent: the caller must also be upstream
 * of every question, which is what `WishlistSignup`'s `upstreamOfQuestions`
 * decides, and the server drops it for any trigger without `acceptsEmail`.
 * Three gates, because the failure is silent in a way nothing else here is —
 * a leaked address does not break a page or fail a build.
 */
export function recordQualifiedAction(trigger: 'email_submitted', email?: string): boolean;
export function recordQualifiedAction(trigger: QualifyingTrigger, email?: string): boolean {
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
    // Re-checked at runtime rather than trusted from the overloads: types are
    // gone by the time this ships, and this is the line that decides whether an
    // address leaves the browser.
    ...(trigger === 'email_submitted' && email ? { email } : {}),
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
 * array would make `fired.length === 0` false at the moment `waitlist_started`
 * fires, and **`Lead` would silently never be reported again**: Events Manager
 * would show the custom twin climbing and the optimizable event flat at zero,
 * with nothing anywhere saying why. Hence a separate key, and hence
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
