import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';

describe('LandingHeader', () => {
  it('provides skip navigation and links to the current landing sections', () => {
    render(<MemoryRouter><LandingHeader /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content');
    const navigation = screen.getByRole('navigation', { name: /primary navigation/i });
    expect(navigation).toHaveTextContent('Product');
    expect(navigation).toHaveTextContent('How it works');
    expect(navigation).toHaveTextContent('Coaches');
    expect(navigation).toHaveTextContent('Pricing');
    expect(screen.getByRole('link', { name: /join the waitlist/i }))
      .toHaveAttribute('href', '#wishlist');
    expect(screen.queryByRole('link', { name: /app store/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /1 week free/i })).not.toBeInTheDocument();
  });

  it('reaches back to the landing waitlist from a legal page', () => {
    // LandingLegalShell renders this with '/', because the waitlist band only
    // exists on the landing page — a bare '#wishlist' would go nowhere there.
    render(<MemoryRouter><LandingHeader sectionPrefix="/" /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /join the waitlist/i }))
      .toHaveAttribute('href', '/#wishlist');
  });
});
