import { render, screen } from '@testing-library/react';
import { TopAnnouncementStrip } from './TopAnnouncementStrip';

describe('TopAnnouncementStrip', () => {
  it('presents the App Store action while visible', () => {
    render(<TopAnnouncementStrip visible />);

    expect(screen.getByLabelText('Download Delirio')).toHaveClass('is-visible');
    expect(screen.getByRole('link', { name: /download delirio on the app store/i })).toHaveAttribute('href', '/app');
  });

  it('removes its action from keyboard navigation while hidden', () => {
    render(<TopAnnouncementStrip visible={false} />);

    const strip = screen.getByLabelText('Download Delirio', { selector: '[aria-hidden="true"]' });
    expect(strip).toHaveClass('is-hidden');
    expect(strip.querySelector('a')).toHaveAttribute('tabindex', '-1');
  });
});
