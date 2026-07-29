import {
  appendQuestionnaireEmailToFirestore,
  submitWarmNetworkWishlistToFirestore,
  type FeedbackAnswers,
} from './feedbackSubmission';

export type WishlistPlacement = 'footer' | 'questionnaire';

export type QuestionnaireWishlistContext = {
  answers: FeedbackAnswers;
  submissionId: string;
};

/**
 * Stores an explicit website wishlist opt-in. Quiz completion updates the
 * existing questionnaire document; a footer-only opt-in creates a warmNetwork
 * record with no questionnaire response attached.
 */
export function submitWishlistToFirestore(
  browserId: string,
  email: string,
  placement: WishlistPlacement,
  questionnaire?: QuestionnaireWishlistContext,
) {
  if (questionnaire) {
    return appendQuestionnaireEmailToFirestore(questionnaire.submissionId, email);
  }

  return submitWarmNetworkWishlistToFirestore(
    browserId,
    {
      wish: JSON.stringify({ submissionType: 'wishlist-opt-in' }),
      coachingUsefulness: JSON.stringify({ placement }),
      nextBuild: JSON.stringify({ consent: 'delirio-launch-and-product-updates' }),
    },
    email,
  );
}
