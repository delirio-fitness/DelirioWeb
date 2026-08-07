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
 * ## `email` is what ships, and the comparison is over
 *
 * Email-first is the default, so it is what every ad lands on. The order test
 * never produced a figure — no campaign had run when the call was made — so this
 * was decided on the shape of the flow rather than on data. `?wo=questions`
 * stays reachable, and records still carry `order`, so the old arm can be walked
 * through and its historical records still read correctly.
 *
 * **`email_submitted` now reports, and only from the email-first opening
 * screen.** In this arm the address arrives before a single question renders,
 * which is the whole reason it is reportable — see `services/conversionEvents`
 * for why that is a position rather than a preference. The questions-first
 * closing screen stays silent permanently, because its email box sits behind six
 * answers.
 *
 * That asymmetry is now live, which matters for exactly one thing: **do not buy
 * traffic against `?wo=questions`.** Meta would see that arm produce gate
 * openings and no registrations, and optimize it away on a difference in
 * instrumentation rather than in the funnel. Walking the arm by hand is fine —
 * a handful of manual visits will not move delivery.
 *
 * **Read the funnel in Firestore, not in Events Manager.** Records carrying an
 * `email` over `waitlist_started` is still the honest completion rate; Meta sees
 * a sampled, ad-attributed slice and always will, since blockers can refuse the
 * beacon.
 *
 * This is the only waitlist experiment left. A `?wl=` parameter once chose
 * between the stepped gate and a single card holding all six questions; that
 * design was scrapped, so the sequence is the only thing still varying.
 */
export const WAITLIST_ORDERS = ['questions', 'email'] as const;

export type WaitlistOrder = (typeof WAITLIST_ORDERS)[number];

/** Email-first is what ships — see the header. `?wo=questions` is opt-in now. */
export const DEFAULT_WAITLIST_ORDER: WaitlistOrder = 'email';

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
