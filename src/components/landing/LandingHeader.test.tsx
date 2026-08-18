import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LandingHeader } from './LandingHeader';

jest.mock('../../services/conversionEvents', () => ({ recordQualifiedAction: jest.fn() }));

describe('LandingHeader', () => {
  it('provides skip navigation and links to the current landing sections', () => {
    render(<MemoryRouter><LandingHeader /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /skip to main content/i })).toHaveAttribute('href', '#main-content');
    const navigation = screen.getByRole('navigation', { name: /primary navigation/i });
    expect(navigation).toHaveTextContent('Product');
    expect(navigation).toHaveTextContent('How it works');
    expect(navigation).toHaveTextContent('Coaches');
    expect(navigation).toHaveTextContent('Pricing');
    expect(screen.queryByRole('link', { name: /waitlist/i })).not.toBeInTheDocument();
  });

  /**
   * The nav needs `sectionPrefix` because `#pricing` means nothing on a legal
   * page. The download does not: it leaves the site, so it is the same link from
   * everywhere the header renders.
   */
  it.each(['' as const, '/' as const])('sends the download straight to the store from prefix %p', (sectionPrefix) => {
    render(<MemoryRouter><LandingHeader sectionPrefix={sectionPrefix} /></MemoryRouter>);

    const cta = screen.getByRole('link', { name: 'DOWNLOAD' });
    expect(cta).toHaveAttribute('href', '/app');
    expect(cta).toHaveAttribute('data-cta', 'store');
    expect(cta).toHaveAttribute('target', '_blank');
  });
});
