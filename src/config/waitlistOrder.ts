/**
 * Which comes first in the waitlist gate: the questions or the email box.
 *
 * - `questions` — six questions, then the email. The shape the gate has always
 *   had, so it is the control. Someone who answers and then declines to give an
 *   address still leaves a usable read on demand, which is why it was built this
 *   way; the cost is six screens of friction in front of the only thing the page
 *   is actually asking for.
 * - `email` — the email box first, then the same questions with a visible way to
 *   skip them. The conversion happens on the first screen, and answering becomes
 *   something a visitor chooses rather than a toll they pay.
 *
 * Selected with `?wo=`, remembered for the tab, and stored on the Firestore
 * record so the two arms can be told apart when the results are read.
 *
 * ## Two things to know before running this
 *
 * **Measure it in Firestore, not in Events Manager.** The metric is emails
 * captured per gate opening, and `waitlist_started` is a clean denominator
 * because it fires on the CTA click in both arms, before either sequence
 * renders. Counting records that carry an `email`, grouped by `order`, answers
 * the question without adding a single ad event.
 *
 * **Do not report `email_submitted` while the test runs.** In the `email` arm
 * the address arrives before any question, which makes it genuinely reportable
 * there — and it is not reportable in the control, where the email box sits
 * behind six answers (see `services/conversionEvents`). Turning it on for one
 * arm means Meta optimizes the two arms differently, and the comparison stops
 * being about the order. Turn it on for whichever arm ships, after.
 *
 * This is the only waitlist experiment left. A `?wl=` parameter once chose
 * between the stepped gate and a single card holding all six questions; that
 * design was scrapped, so the sequence is the only thing still varying.
 */
export const WAITLIST_ORDERS = ['questions', 'email'] as const;

export type WaitlistOrder = (typeof WAITLIST_ORDERS)[number];

/** Questions-first is the shape the gate already had, so it is the baseline. */
export const DEFAULT_WAITLIST_ORDER: WaitlistOrder = 'questions';

export const WAITLIST_ORDER_QUERY_PARAM = 'wo';

const STORAGE_KEY = 'delirio:waitlist-order';

export function isWaitlistOrder(value: unknown): value is WaitlistOrder {
  return typeof value === 'string' && (WAITLIST_ORDERS as readonly string[]).includes(value);
}

function readStoredOrder(): WaitlistOrder | null {
  try {
    const stored = window.sessionStorage.getItem(STORAGE_KEY);
    return isWaitlistOrder(stored) ? stored : null;
  } catch {
    // Private-mode storage denial costs us the arm on internal navigation only.
    return null;
  }
}

function persistOrder(order: WaitlistOrder): void {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, order);
  } catch {
    // See readStoredOrder: an unavailable store is not worth failing a render.
  }
}

/**
 * Resolves the arm for this visit. An explicit `?wo=` wins and is remembered for
 * the tab, so reopening the gate — or coming back from the privacy policy — does
 * not move someone between arms halfway through and corrupt both counts.
 */
export function resolveWaitlistOrder(search: string = window.location.search): WaitlistOrder {
  const requested = new URLSearchParams(search).get(WAITLIST_ORDER_QUERY_PARAM);
  if (isWaitlistOrder(requested)) {
    persistOrder(requested);
    return requested;
  }
  return readStoredOrder() ?? DEFAULT_WAITLIST_ORDER;
}
