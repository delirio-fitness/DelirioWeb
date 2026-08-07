import {
  appendWaitlistEmailToFirestore,
  submitWarmNetworkWishlistToFirestore,
} from './feedbackSubmission';
import { submitWishlistToFirestore } from './wishlistSubmission';

jest.mock('./feedbackSubmission', () => ({
  appendWaitlistEmailToFirestore: jest.fn(),
  submitWarmNetworkWishlistToFirestore: jest.fn(),
}));

const appendQuestionnaireEmailMock = jest.mocked(appendWaitlistEmailToFirestore);
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
      { submissionId: 'anonymous-quiz-document-id' },
    );

    expect(appendQuestionnaireEmailMock).toHaveBeenCalledTimes(1);
    expect(appendQuestionnaireEmailMock).toHaveBeenCalledWith(
      'anonymous-quiz-document-id',
      'person@example.com',
    );
  });

  it('creates a standalone opt-in in warmNetwork when no answers were given', async () => {
    submitWarmNetworkWishlistMock.mockResolvedValue('warm-network-document-id');

    await submitWishlistToFirestore('browser_id_1234567890', 'person@example.com', 'landing');

    expect(submitWarmNetworkWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
    );
  });
});
