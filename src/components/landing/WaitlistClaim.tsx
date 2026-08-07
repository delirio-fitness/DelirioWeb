import { useId } from 'react';
import { WAITLIST_OPEN_QUESTION } from '../../content/waitlistQuestions';
import { WishlistSignup } from './WishlistSignup';

type WaitlistClaimProps = {
  openResponse: string;
  onOpenResponseChange: (value: string) => void;
  /** Writes the text to the answer document. Called on blur — see WaitlistModal. */
  onCommitOpenResponse: () => void;
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
          onBlur={onCommitOpenResponse}
        />
      </div>

      {withEmail && (
        <WishlistSignup placement="questionnaire" onResolveSubmissionId={onResolveSubmissionId} />
      )}
    </>
  );
}
