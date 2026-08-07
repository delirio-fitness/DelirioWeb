import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { recordQualifiedAction } from '../../services/conversionEvents';
import { submitWishlistToFirestore } from '../../services/wishlistSubmission';
import { WishlistSignup } from './WishlistSignup';

jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn(),
}));

jest.mock('../../services/conversionEvents', () => ({
  recordQualifiedAction: jest.fn(),
}));

jest.mock('../../utils/browserFeedbackId', () => ({
  getBrowserFeedbackId: () => 'browser_id_1234567890',
}));

const submitWishlistMock = submitWishlistToFirestore as jest.MockedFunction<typeof submitWishlistToFirestore>;
const recordMock = jest.mocked(recordQualifiedAction);

describe('WishlistSignup', () => {
  beforeEach(() => {
    submitWishlistMock.mockReset();
    recordMock.mockReset();
  });

  async function joinWith(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));
  }

  it('reports the conversion from the standalone band, which asks nothing', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('wishlist-document-id');
    render(<WishlistSignup placement="landing" />);

    await joinWith(user);

    await waitFor(() => expect(recordMock).toHaveBeenCalledWith('email_submitted'));
  });

  /**
   * The copy inside the gate is unlocked by all six waitlist answers, so a
   * conversion fired here would tell Meta who gave them through timing alone.
   * This form reports nothing — see `conversionEvents`.
   */
  it('reports nothing from the copy inside the waitlist gate', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('wishlist-document-id');
    render(
      <WishlistSignup placement="questionnaire" onResolveSubmissionId={() => Promise.resolve('id')} />,
    );

    await joinWith(user);

    expect(await screen.findByRole('status')).toHaveTextContent(/you.re on the waitlist/i);
    expect(recordMock).not.toHaveBeenCalled();
  });

  it('normalizes a valid email and confirms the opt-in', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('wishlist-document-id');
    render(<WishlistSignup />);

    expect(screen.getByText('DELIRIO')).toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: /email address/i }), '  PERSON@Example.COM  ');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'landing',
      undefined,
    ));
    expect(await screen.findByRole('status')).toHaveTextContent(/you.re on the waitlist/i);
  });

  it('rejects an invalid email without submitting', async () => {
    const user = userEvent.setup();
    render(<WishlistSignup />);

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/enter a valid email address/i);
    expect(submitWishlistMock).not.toHaveBeenCalled();
  });

  it('keeps the form available when Firestore rejects the submission', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockRejectedValue(new Error('permission denied'));
    render(<WishlistSignup />);

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/unable to join right now/i);
    expect(screen.getByRole('button', { name: /^join$/i })).toBeEnabled();
  });

  it('attaches a questionnaire submission to the answers it belongs to', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('questionnaire-wishlist-document-id');
    render(
      <WishlistSignup
        placement="questionnaire"
        onResolveSubmissionId={() => Promise.resolve('quiz-document-id')}
      />,
    );

    // The gate supplies the heading and framing, so the form brings neither.
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      { submissionId: 'quiz-document-id' },
    ));
  });

  it('waits for an in-flight answer write instead of forking a second record', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('questionnaire-wishlist-document-id');
    let releaseAnswerWrite = (_submissionId: string | null) => {};
    const pendingWrite = new Promise<string | null>((resolve) => { releaseAnswerWrite = resolve; });
    render(
      <WishlistSignup placement="questionnaire" onResolveSubmissionId={() => pendingWrite} />,
    );

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    expect(submitWishlistMock).not.toHaveBeenCalled();
    releaseAnswerWrite('quiz-document-id');

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      { submissionId: 'quiz-document-id' },
    ));
  });

  it('still captures the email when the answer write failed', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('standalone-document-id');
    render(
      <WishlistSignup placement="questionnaire" onResolveSubmissionId={() => Promise.resolve(null)} />,
    );

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      undefined,
    ));
    expect(await screen.findByRole('status')).toHaveTextContent(/you.re on the waitlist/i);
  });
});
