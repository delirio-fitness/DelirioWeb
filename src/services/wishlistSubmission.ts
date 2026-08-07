import {
  appendWaitlistEmailToFirestore,
  submitWarmNetworkWishlistToFirestore,
} from './feedbackSubmission';

export type WishlistPlacement = 'landing' | 'questionnaire';

/** Identifies the answer document an email should be attached to. */
export type QuestionnaireWishlistContext = {
  submissionId: string;
};

/**
 * Routes an explicit waitlist opt-in to the right record. An email that arrived
 * through the gate is patched onto the answers the visitor just gave; one that
 * arrived without answering anything becomes a standalone warmNetwork lead.
 */
export function submitWishlistToFirestore(
  browserId: string,
  email: string,
  placement: WishlistPlacement,
  questionnaire?: QuestionnaireWishlistContext,
) {
  if (questionnaire) {
    return appendWaitlistEmailToFirestore(questionnaire.submissionId, email);
  }

  return submitWarmNetworkWishlistToFirestore(browserId, email);
}
