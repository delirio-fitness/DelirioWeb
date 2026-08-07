import { useId, useState } from 'react';
import { WAITLIST_OPEN_QUESTION } from '../../content/waitlistQuestions';
import { WishlistSignup } from './WishlistSignup';

type WaitlistClaimProps = {
  openResponse: string;
  onOpenResponseChange: (value: string) => void;
  /**
   * Writes the text to the answer document and resolves to whether it landed.
   * Called from the send button and, as a safety net, on blur — see WaitlistModal.
   */
  onCommitOpenResponse: () => Promise<boolean>;
  onResolveSubmissionId: () => Promise<string | null>;
  saveFailed: boolean;
  /**
   * Whether to ask for an email. False on the email-first arm's closing screen,
   * where the address was given six screens ago and asking again would read as
   * the form having lost it.
   */
  withEmail?: boolean;
};

/**
 * The end of both designs: the optional open question, then the email box.
 *
 * Shared rather than duplicated so the two designs cannot drift at the exact
 * point being compared — if the last screen differed, a difference in signup
 * rate would say nothing about the question layouts above it.
 */
export function WaitlistClaim({
  openResponse,
  onOpenResponseChange,
  onCommitOpenResponse,
  onResolveSubmissionId,
  saveFailed,
  withEmail = true,
}: WaitlistClaimProps) {
  const fieldId = `waitlist-open-${useId().replace(/:/g, '')}`;
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState<{ text: string; saved: boolean } | null>(null);

  const trimmed = openResponse.trim();
  // Keyed to the text it describes, so editing after a send clears the
  // confirmation rather than leaving "Saved" standing over a changed answer.
  const outcome = sent?.text === trimmed ? sent : null;

  async function send() {
    setIsSending(true);
    const saved = await onCommitOpenResponse();
    setIsSending(false);
    setSent({ text: trimmed, saved });
  }

  return (
    <>
      {saveFailed && (
        <p className="d3-questionnaire-save-warning" role="status">
          We could not save your answers just now — you can still join below.
        </p>
      )}

      <div className="d3-questionnaire-open">
        <label htmlFor={fieldId}>
          <b>{WAITLIST_OPEN_QUESTION.prompt}</b>
          <i>Optional</i>
        </label>
        <textarea
          id={fieldId}
          value={openResponse}
          maxLength={600}
          rows={3}
          placeholder={WAITLIST_OPEN_QUESTION.placeholder}
          onChange={(event) => onOpenResponseChange(event.target.value)}
          onBlur={() => void onCommitOpenResponse()}
        />
        {/* Blur already saves this, but silently — and a field that gives no
            sign it kept anything reads as a field that is going nowhere. The
            button is the visitor's evidence, not the write path. */}
        <div className="d3-questionnaire-open-actions">
          <button type="button" onClick={send} disabled={trimmed.length === 0 || isSending}>
            {isSending ? 'SENDING…' : 'SEND ANSWER'}
          </button>
          <p
            className={`d3-questionnaire-open-status${outcome?.saved === false ? ' d3-questionnaire-open-status--failed' : ''}`}
            role="status"
          >
            {outcome?.saved === true && 'Saved — thank you.'}
            {outcome?.saved === false && 'We could not save that just now.'}
          </p>
        </div>
      </div>

      {withEmail && (
        <WishlistSignup placement="questionnaire" onResolveSubmissionId={onResolveSubmissionId} />
      )}
    </>
  );
}
