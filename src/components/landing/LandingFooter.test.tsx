import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingFooter } from './LandingFooter';

describe('LandingFooter', () => {
  it('replaces the wishlist form with Apple’s official download badge', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    const badge = screen.getByRole('link', { name: /download delirio on the app store/i });
    expect(badge).toHaveAttribute('href', 'https://apps.apple.com/us/app/delirio-ai-personal-trainer/id6756231078');
    expect(badge).toHaveAttribute('target', '_blank');
    expect(screen.getByText('DOWNLOAD NOW ON THE APP STORE')).toBeInTheDocument();
    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
  });
});
