import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { WAITLIST_QUESTIONS } from '../../content/waitlistQuestions';
import { WaitlistModal } from './WaitlistModal';

jest.mock('../../services/feedbackSubmission', () => ({
  submitWaitlistAnswersToFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
  updateWaitlistAnswersInFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
}));
jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn().mockResolvedValue('waitlist-document-id'),
}));

expect.extend(toHaveNoViolations);

describe('WaitlistModal accessibility', () => {
  jest.setTimeout(15_000);

  it('has no detectable violations on the stepped intro', async () => {
    render(<WaitlistModal open design="steps" />);

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no detectable violations part-way through the stepped questions', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open design="steps" startAtFirstQuestion />);

    await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));
    await screen.findByRole('radio', { name: WAITLIST_QUESTIONS[1].options[0].label });

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no detectable violations on the single page, locked or unlocked', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open design="single" />);

    expect(await axe(document.body)).toHaveNoViolations();

    for (const question of WAITLIST_QUESTIONS) {
      await user.click(screen.getByRole('radio', { name: question.options[0].label }));
    }
    await screen.findByRole('textbox', { name: /email address/i });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
