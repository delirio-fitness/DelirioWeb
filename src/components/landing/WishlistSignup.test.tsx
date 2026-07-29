import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { submitWishlistToFirestore } from '../../services/wishlistSubmission';
import { WishlistSignup } from './WishlistSignup';

jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn(),
}));

jest.mock('../../utils/browserFeedbackId', () => ({
  getBrowserFeedbackId: () => 'browser_id_1234567890',
}));

const submitWishlistMock = submitWishlistToFirestore as jest.MockedFunction<typeof submitWishlistToFirestore>;

describe('WishlistSignup', () => {
  beforeEach(() => submitWishlistMock.mockReset());

  it('normalizes a valid email and confirms the opt-in', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('wishlist-document-id');
    render(<WishlistSignup />);

    await user.type(screen.getByRole('textbox', { name: /email address/i }), '  PERSON@Example.COM  ');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'footer',
      undefined,
    ));
    expect(await screen.findByRole('status')).toHaveTextContent(/you.re on the wishlist/i);
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

  it('submits from the questionnaire without rendering a navigation link', async () => {
    const user = userEvent.setup();
    submitWishlistMock.mockResolvedValue('questionnaire-wishlist-document-id');
    const questionnaire = {
      submissionId: 'quiz-document-id',
      answers: {
        wish: JSON.stringify({ glp1Context: 'current' }),
        coachingUsefulness: JSON.stringify({ trainingStatus: 'consistent' }),
        nextBuild: JSON.stringify({ productPriority: 'guidance_i_can_trust' }),
      },
    };
    render(<WishlistSignup placement="questionnaire" questionnaire={questionnaire} />);

    expect(screen.getByRole('heading', { name: /join the waitlist/i })).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      questionnaire,
    ));
  });
});
