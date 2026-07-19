import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TermsServices from './TermsServices';

describe('TermsServices', () => {
  it('describes production subscriptions and omits legacy pre-release terms', () => {
    render(<MemoryRouter><TermsServices /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Subscriptions and Billing' })).toBeInTheDocument();
    expect(screen.getByText('$30 per month, billed monthly.')).toBeInTheDocument();
    expect(screen.getByText('$180 per year, billed annually (equivalent to $15 per month).')).toBeInTheDocument();
  });
});
