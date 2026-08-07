/**
 * Transport for conversion reporting. Replaces the Meta browser pixel.
 *
 * Nothing here decides what is worth reporting — see `conversionEvents` for
 * that — and nothing here knows the dataset ID, the access token, or what a
 * trigger is worth. All of that lives in `netlify/functions/conversion.mts`,
 * which is the only code that talks to Meta.
 *
 * That split is the point. `fbevents.js` used to run in this page with full DOM
 * access, reporting the URL and title of every page it loaded on and, with one
 * checkbox in Events Manager, the contents of the email field. The waitlist asks
 * questions that a visitor would not want an ad network reading over their
 * shoulder, so nothing third-party is allowed to run alongside it. What leaves
 * the browser now is a slug and a click ID.
 *
 * The request is same-origin, so tracking protection and content blockers can
 * still refuse it. That is deliberate: routing conversions through our own
 * server to make them unblockable would take away the only control a visitor
 * has left, which is the opposite of why the pixel was removed.
 */

import { IS_DEV } from '../config/runtime';
import type { Attribution } from '../utils/attribution';

const ENDPOINT = '/.netlify/functions/conversion';

export type ConversionBeacon = {
  /** Slug the function resolves into an event name and an intent value. */
  trigger: string;
  /** Shared by both events Meta receives, and its dedup key across retries. */
  eventId: string;
  /** Landing experiment cell, reported as `content_category`. */
  variant?: string;
  /**
   * Whether this is the visit's first qualifying action. Decided here because
   * the per-visit record is `sessionStorage`; the server turns it into "send
   * `Lead` or not", which is what makes `Lead` count visitors, not actions.
   */
  firstOfVisit: boolean;
  attribution: Attribution;
};

/**
 * Reports a conversion, and never makes the caller wait for it.
 *
 * `keepalive` so a click that navigates away still delivers, and every failure
 * is swallowed: a conversion that does not arrive is a measurement problem, and
 * an exception raised into a form submit handler is a product one.
 */
export function sendConversion({
  trigger,
  eventId,
  variant,
  firstOfVisit,
  attribution,
}: ConversionBeacon): void {
  const { fbclid, capturedAt, ...campaign } = attribution;

  const body = {
    trigger,
    eventId,
    variant,
    firstOfVisit,
    fbclid,
    fbclidAt: capturedAt,
    attribution: campaign,
  };

  if (IS_DEV) {
    // No function runs under `npm run dev`, so this console line is the only way
    // to see what production would have sent.
    console.info(`[delirio-ads] ${trigger}`, body);
    return;
  }

  void fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => {
    // Blocked, offline, or refused. Nothing to retry against and nothing the
    // visitor should ever see.
  });
}
