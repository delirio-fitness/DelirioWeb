import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingFooter } from './LandingFooter';

describe('LandingFooter', () => {
  it('sends the download slot to the waitlist instead of the App Store', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    // Default prefix is '/', because the footer also renders on the legal pages.
    expect(screen.getByRole('link', { name: /join the waitlist/i }))
      .toHaveAttribute('href', '/#wishlist');
    expect(screen.queryByRole('link', { name: /app store/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/download/i)).not.toBeInTheDocument();
  });

  it('carries no second signup form, so the band above owns the conversion', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
  });

  it('keeps the waitlist link on the page for an in-page footer', () => {
    render(<MemoryRouter><LandingFooter sectionPrefix="" /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /join the waitlist/i }))
      .toHaveAttribute('href', '#wishlist');
  });
});
