import {
  appendWaitlistEmailToFirestore,
  submitStandaloneWaitlistEmailToFirestore,
} from './feedbackSubmission';
import { submitWishlistToFirestore } from './wishlistSubmission';

jest.mock('./feedbackSubmission', () => ({
  appendWaitlistEmailToFirestore: jest.fn(),
  submitStandaloneWaitlistEmailToFirestore: jest.fn(),
}));

const appendQuestionnaireEmailMock = jest.mocked(appendWaitlistEmailToFirestore);
const submitStandaloneWaitlistEmailMock = jest.mocked(submitStandaloneWaitlistEmailToFirestore);

describe('submitWishlistToFirestore', () => {
  afterEach(() => {
    appendQuestionnaireEmailMock.mockReset();
    submitStandaloneWaitlistEmailMock.mockReset();
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

  it('creates a standalone opt-in when no answers were given', async () => {
    submitStandaloneWaitlistEmailMock.mockResolvedValue('standalone-document-id');

    await submitWishlistToFirestore('browser_id_1234567890', 'person@example.com', 'landing');

    expect(submitStandaloneWaitlistEmailMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
    );
  });
});
