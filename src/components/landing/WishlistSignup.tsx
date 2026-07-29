import { useId, useState, type FormEvent } from 'react';
import { submitWishlistToFirestore, type QuestionnaireWishlistContext } from '../../services/wishlistSubmission';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';
import { Logo } from '../logo';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type WishlistSignupProps = {
  placement?: 'footer' | 'questionnaire';
  questionnaire?: QuestionnaireWishlistContext;
};

export function WishlistSignup({ placement = 'footer', questionnaire }: WishlistSignupProps) {
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
      await submitWishlistToFirestore(getBrowserFeedbackId(), normalizedEmail, placement, questionnaire);
      setEmail('');
      setStatus('success');
    } catch {
      setStatus('idle');
      setError('Unable to join right now. Please try again.');
    }
  }

  return (
    <section
      id={isQuestionnaire ? undefined : 'wishlist'}
      className={`d3-wishlist${isQuestionnaire ? ' d3-wishlist--questionnaire' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="d3-wishlist-copy">
        {isQuestionnaire ? <p>ONE LAST STEP</p> : (
          <div className="d3-wishlist-brand">
            <Logo color="white" width="34" height="48" />
            <span>DELIRIO</span>
          </div>
        )}
        {isQuestionnaire ? (
          <h3 id={titleId}>JOIN THE WAITLIST.</h3>
        ) : (
          <h2 id={titleId}>BE FIRST TO KNOW<br />WHAT COMES NEXT.</h2>
        )}
        <span>{isQuestionnaire
          ? 'Leave your email to hear when Delirio is ready.'
          : 'Join the Delirio wishlist for launch access and occasional product updates.'}</span>
      </div>

      {status === 'success' ? (
        <div className="d3-wishlist-success" role="status">
          <strong>{isQuestionnaire ? "YOU'RE ON THE WAITLIST." : "YOU'RE ON THE WISHLIST."}</strong>
          <span>We will email you when Delirio is ready.</span>
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
