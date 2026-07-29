import {
  appendQuestionnaireEmailToFirestore,
  submitWarmNetworkWishlistToFirestore,
} from './feedbackSubmission';
import { submitWishlistToFirestore } from './wishlistSubmission';

jest.mock('./feedbackSubmission', () => ({
  appendQuestionnaireEmailToFirestore: jest.fn(),
  submitWarmNetworkWishlistToFirestore: jest.fn(),
}));

const appendQuestionnaireEmailMock = jest.mocked(appendQuestionnaireEmailToFirestore);
const submitWarmNetworkWishlistMock = jest.mocked(submitWarmNetworkWishlistToFirestore);

describe('submitWishlistToFirestore', () => {
  afterEach(() => {
    appendQuestionnaireEmailMock.mockReset();
    submitWarmNetworkWishlistMock.mockReset();
  });

  it('appends only the email to the existing quiz document', async () => {
    appendQuestionnaireEmailMock.mockResolvedValue('anonymous-quiz-document-id');

    await submitWishlistToFirestore(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      {
        submissionId: 'anonymous-quiz-document-id',
        answers: {
          wish: JSON.stringify({ questionnaireVersion: 6, glp1Context: 'current' }),
          coachingUsefulness: JSON.stringify({ trainingPattern: 'planning_load' }),
          nextBuild: JSON.stringify({ painfulConsequence: 'wasting_the_limited_time_i_have' }),
        },
      },
    );

    expect(appendQuestionnaireEmailMock).toHaveBeenCalledTimes(1);
    expect(appendQuestionnaireEmailMock).toHaveBeenCalledWith(
      'anonymous-quiz-document-id',
      'person@example.com',
    );
  });

  it('creates a footer-only opt-in in warmNetwork', async () => {
    submitWarmNetworkWishlistMock.mockResolvedValue('warm-network-document-id');

    await submitWishlistToFirestore('browser_id_1234567890', 'person@example.com', 'footer');

    expect(submitWarmNetworkWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      {
        wish: JSON.stringify({ submissionType: 'wishlist-opt-in' }),
        coachingUsefulness: JSON.stringify({ placement: 'footer' }),
        nextBuild: JSON.stringify({ consent: 'delirio-launch-and-product-updates' }),
      },
      'person@example.com',
    );
  });
});
