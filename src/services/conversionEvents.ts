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
 *    triggers below sit upstream of the first question. Nothing downstream of it
 *    may be added, and that includes the email box inside the gate, which only
 *    opens once all six answers are given.
 *
 *    **This rule does not loosen when the questions do.** It held when the third
 *    question asked about GLP-1 titration stage; it still holds now that the set
 *    avoids describing anyone's body at all. It governs where an event fires,
 *    not how sensitive this month's wording happens to be — which is the whole
 *    reason it survives rewrites of the question bank.
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
 * something after 30 seconds is not an action.
 *
 * `email_submitted` — an address given in the standalone waitlist band, which
 * asks no questions. The copy of the form inside the gate does not report: it
 * sits behind all six answers.
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
