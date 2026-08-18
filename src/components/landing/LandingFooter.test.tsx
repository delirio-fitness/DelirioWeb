import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingFooter } from './LandingFooter';

jest.mock('../../services/conversionEvents', () => ({ recordQualifiedAction: jest.fn() }));

describe('LandingFooter', () => {
  it('sends the download slot to the App Store', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    const badge = screen.getByRole('link', { name: /download delirio on the app store/i });
    expect(badge).toHaveAttribute('href', '/app');
    // Every store link reports; artwork is no exception. See AppStoreLink.
    expect(badge).toHaveAttribute('data-cta', 'store');
    expect(screen.queryByRole('link', { name: /waitlist/i })).not.toBeInTheDocument();
  });

  /**
   * The footer renders on the legal pages too, where a bare `#pricing` would go
   * nowhere — but the store link is absolute and must not pick up the prefix.
   */
  it.each(['' as const, '/' as const])('keeps the store link prefix-free at prefix %p', (sectionPrefix) => {
    render(<MemoryRouter><LandingFooter sectionPrefix={sectionPrefix} /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /download delirio on the app store/i }))
      .toHaveAttribute('href', '/app');
    expect(screen.getByRole('link', { name: 'Plans' }))
      .toHaveAttribute('href', `${sectionPrefix}#pricing`);
  });

  it('carries no signup form, now that the site collects no addresses', () => {
    render(<MemoryRouter><LandingFooter /></MemoryRouter>);

    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    // The opt-out line went with the list it was the only way off.
    expect(document.querySelector('.d3-footer-optout')).toBeNull();
  });
});
