import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TermsServices from './TermsServices';

describe('TermsServices', () => {
  it('names the founding rate the app sells and the standard rate it strikes through', () => {
    render(<MemoryRouter><TermsServices /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Subscriptions and Billing' })).toBeInTheDocument();
    expect(screen.getByText(/The standard rate is \$29\.99 per month or \$179\.99 per year\./)).toBeInTheDocument();
    expect(screen.getByText(/founding rate: \$4\.99 per month or \$29\.99 per year\./)).toBeInTheDocument();
    expect(screen.getByText(/renews at the same rate for as long as your subscription stays active/)).toBeInTheDocument();
    expect(screen.getByText('Last updated: September 5, 2026')).toBeInTheDocument();
  });
});
