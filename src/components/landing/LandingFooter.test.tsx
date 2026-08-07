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

  /**
   * The waitlist form lives behind the gate, so this is the only route off the
   * list anywhere on the site — and it renders on the legal pages too, which is
   * where someone looking for it will go. Deleting it leaves people with no way
   * out of a record holding their email and their answers together.
   */
  it('offers the only way off the waitlist, on every page it renders', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    const optOut = document.querySelector('.d3-footer-optout a');
    expect(optOut).toHaveAttribute('href', expect.stringContaining('mailto:contact@delirio.fit'));
    expect(screen.getByText(/leave the waitlist and have your answers deleted/i)).toBeInTheDocument();
  });

  it('keeps the waitlist link on the page for an in-page footer', () => {
    render(<MemoryRouter><LandingFooter sectionPrefix="" /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /join the waitlist/i }))
      .toHaveAttribute('href', '#wishlist');
  });
});
