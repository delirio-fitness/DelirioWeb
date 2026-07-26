import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FeedbackSection } from './FeedbackSection';

expect.extend(toHaveNoViolations);

describe('FeedbackSection accessibility', () => {
  it('has no detectable accessibility violations on the initial question', async () => {
    const { container } = render(<FeedbackSection />);

    expect(await axe(container)).toHaveNoViolations();
  });

  it('has no detectable accessibility violations after progressing', async () => {
    const user = userEvent.setup();
    const { container } = render(<FeedbackSection />);

    await user.click(screen.getByRole('radio', { name: 'A plan that adjusts around my schedule' }));
    await screen.findByRole('radio', { name: 'Clearer movement explanations' });

    expect(await axe(container)).toHaveNoViolations();
  });
});
