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
    const download = screen.getByRole('link', { name: /try 1 week free/i });
    expect(download).toHaveAttribute('href', '/app');
    expect(download).toHaveAttribute('target', '_blank');
  });
});
