import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { FeedbackSection } from './FeedbackSection';

expect.extend(toHaveNoViolations);

describe('FeedbackSection accessibility', () => {
  it('has no detectable accessibility violations on the initial question', async () => {
    render(<FeedbackSection open />);

    expect(await axe(document.body)).toHaveNoViolations();
  });

  it('has no detectable accessibility violations after progressing', async () => {
    const user = userEvent.setup();
    render(<FeedbackSection open />);

    await user.click(screen.getByRole('radio', { name: 'Prefer not to say' }));
    await screen.findByRole('radio', {
      name: 'I stay active, but planning it takes too much effort',
    });

    expect(await axe(document.body)).toHaveNoViolations();
  });
});
