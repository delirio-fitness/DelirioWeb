import { useId, useState, type FormEvent } from 'react';
import { recordQualifiedAction } from '../../services/conversionEvents';
import { submitWishlistToFirestore } from '../../services/wishlistSubmission';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';
import { Logo } from '../logo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WishlistSignupProps = {
  placement?: 'landing' | 'questionnaire';
  /**
   * Resolves the answer document this email belongs to. Awaited on submit, so a
   * visitor who types faster than the answer write completes still lands on one
   * record instead of two. Resolving to `null` is not a failure — the email is
   * then stored on its own.
   */
  onResolveSubmissionId?: () => Promise<string | null>;
  /**
   * Takes over the write entirely, and is mutually exclusive with the resolver
   * above. Supplied by the email-first arm (`config/waitlistOrder`), where this
   * form runs before any question and the address *creates* the record rather
   * than joining one that already exists. The parent advances past this form on
   * success, so the confirmation state below never renders in that arm.
   */
  onSubmitEmail?: (email: string) => Promise<void>;
  /**
   * Whether this copy of the form renders before the visitor has seen a single
   * waitlist question — the one condition that makes `email_submitted`
   * reportable. See `services/conversionEvents` for why it is a position and not
   * a preference.
   *
   * It is a prop rather than something read from `config/waitlistOrder` here
   * because what licenses the conversion is *where this form sits*, not which
   * arm is running. A future flow that moves the email box gets the answer wrong
   * by default and has to say so deliberately, which is the safe direction for
   * this particular mistake.
   *
   * Defaults from the placement: the standalone band asks nothing at all, so it
   * is upstream by construction.
   */
  upstreamOfQuestions?: boolean;
};

/**
 * The email capture itself.
 *
 * `questionnaire` placement renders the form alone: it sits inside the waitlist
 * gate, which supplies its own heading and framing, and a second one here read
 * as the dialog asking twice.
 */
export function WishlistSignup({
  placement = 'landing',
  onResolveSubmissionId,
  onSubmitEmail,
  upstreamOfQuestions = placement === 'landing',
}: WishlistSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const instanceId = useId().replace(/:/g, '');
  const titleId = `wishlist-title-${instanceId}`;
  const emailId = `wishlist-email-${instanceId}`;
  const consentId = `wishlist-consent-${instanceId}`;
  const isQuestionnaire = placement === 'questionnaire';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setError('Enter a valid email address.');
      return;
    }

    setError(null);
    setStatus('submitting');
    try {
      if (onSubmitEmail) {
        await onSubmitEmail(normalizedEmail);
      } else {
        const submissionId = onResolveSubmissionId ? await onResolveSubmissionId() : null;
        await submitWishlistToFirestore(
          getBrowserFeedbackId(),
          normalizedEmail,
          placement,
          submissionId ? { submissionId } : undefined,
        );
      }
      setEmail('');
      setStatus('success');
      // Reports only where the address arrives before any question has been
      // shown — the standalone band, and the email-first arm's opening screen.
      //
      // The questions-first closing screen stays silent permanently: its email
      // box is unlocked by all six answers, so a conversion there would tell
      // Meta who gave them through timing alone, whatever the event is named.
      // See `services/conversionEvents`.
      if (upstreamOfQuestions) recordQualifiedAction('email_submitted');
    } catch {
      setStatus('idle');
      setError('Unable to join right now. Please try again.');
    }
  }

  return (
    <section
      id={isQuestionnaire ? undefined : 'wishlist'}
      className={`d3-wishlist${isQuestionnaire ? ' d3-wishlist--questionnaire' : ''}`}
      aria-label={isQuestionnaire ? 'Join the waitlist' : undefined}
      aria-labelledby={isQuestionnaire ? undefined : titleId}
    >
      {!isQuestionnaire && (
        <div className="d3-wishlist-copy">
          <div className="d3-wishlist-brand">
            <Logo color="white" width="34" height="48" />
            <span>DELIRIO</span>
          </div>
          <h2 id={titleId}>BE FIRST TO KNOW<br />WHAT COMES NEXT.</h2>
          <span>Join the Delirio waitlist for early access and occasional product updates.</span>
        </div>
      )}

      {status === 'success' ? (
        <div className="d3-wishlist-success" role="status">
          <strong>YOU’RE ON THE WAITLIST.</strong>
          <span>We will email you when your spot is ready.</span>
        </div>
      ) : (
        <div className="d3-wishlist-entry">
          <form onSubmit={submit} noValidate>
            <label className="d3-visually-hidden" htmlFor={emailId}>Email address</label>
            <input
              id={emailId}
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="EMAIL ADDRESS"
              aria-describedby={consentId}
              aria-invalid={Boolean(error)}
              disabled={status === 'submitting'}
            />
            <button type="submit" disabled={status === 'submitting'}>
              <span>{status === 'submitting' ? 'JOINING…' : 'JOIN'}</span>
            </button>
          </form>
          <p id={consentId}>By joining, you agree to receive Delirio launch and product emails. Unsubscribe anytime.</p>
          {error && <p className="d3-wishlist-error" role="alert">{error}</p>}
        </div>
      )}
    </section>
  );
}
