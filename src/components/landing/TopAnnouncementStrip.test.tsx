import { render, screen } from '@testing-library/react';
import { TopAnnouncementStrip } from './TopAnnouncementStrip';

describe('TopAnnouncementStrip', () => {
  it('presents the wishlist action while visible', () => {
    render(<TopAnnouncementStrip visible />);

    expect(screen.getByLabelText('Delirio wishlist invitation')).toHaveClass('is-visible');
    expect(screen.getByRole('link', { name: /join the delirio wishlist/i })).toHaveAttribute('href', '#wishlist');
  });

  it('removes its action from keyboard navigation while hidden', () => {
    render(<TopAnnouncementStrip visible={false} />);

    const strip = screen.getByLabelText('Delirio wishlist invitation', { selector: '[aria-hidden="true"]' });
    expect(strip).toHaveClass('is-hidden');
    expect(strip.querySelector('a')).toHaveAttribute('tabindex', '-1');
  });
});
