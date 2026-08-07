import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WAITLIST_QUESTIONS } from '../../content/waitlistQuestions';
import { WaitlistModal } from './WaitlistModal';

jest.mock('../../services/feedbackSubmission', () => ({
  submitWaitlistAnswersToFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
  submitWaitlistEmailToFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
  updateWaitlistAnswersInFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
}));
jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
}));

expect.extend(toHaveNoViolations);

describe('WaitlistModal accessibility', () => {
  jest.setTimeout(15_000);

  it('has no detectable violations on the intro', async () => {
    render(<WaitlistModal open />);

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no detectable violations part-way through the questions', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open startAtFirstQuestion />);

    await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));
    await screen.findByRole('radio', { name: WAITLIST_QUESTIONS[1].options[0].label });

    expect(await axe(document.body)).toHaveNoViolations();
  });

  /** The `?wo=email` arm, whose opening screen and skip control are its own markup. */
  it('has no detectable violations across the email-first arm', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open order="email" />);

    expect(await axe(document.body)).toHaveNoViolations();

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
    await user.click(screen.getByRole('button', { name: /^join$/i }));
    await screen.findByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label });

    expect(await axe(document.body)).toHaveNoViolations();

    await user.click(screen.getByRole('button', { name: /skip for now/i }));
    await screen.findByText(/you.re on the waitlist/i);

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
