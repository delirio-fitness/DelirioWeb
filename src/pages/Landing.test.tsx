import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const disconnect = jest.fn();
const connect = jest.fn();
const clearMessages = jest.fn();

jest.mock('../utils/pipecatConfig', () => ({
  generateDiscoveryId: () => 'test-session',
}));

jest.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({
    sessionState: 'idle',
    isBotSpeaking: false,
    isBotProcessing: false,
    isUserSpeaking: false,
    botTranscript: '',
    botTurns: [],
    userTranscript: '',
    failureKind: null,
    frequencyLevels: Array(16).fill(0),
    isFrequencyListening: false,
    connect,
    disconnect,
    cancelConnect: disconnect,
  }),
}));

jest.mock('../hooks/useTextChat', () => ({
  useTextChat: () => ({
    messages: [{ role: 'user', text: 'Existing preview' }],
    isLoading: false,
    connectionState: 'idle',
    error: null,
    failedMessage: null,
    sendMessage: jest.fn(),
    retryLastMessage: jest.fn(),
    clearMessages,
  }),
}));

import Landing from './Landing';

describe('Landing journey', () => {
  it('starts voice automatically after the initial coach choice', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /choose how you.*want to be coached/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reed.*select coach/i }));
    expect(screen.getByAltText(/reed, selected delirio coach/i)).toBeInTheDocument();
    expect(connect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: /start voice session/i })).not.toBeInTheDocument();
  });

  it('disconnects voice when switching to text', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /reed.*select coach/i }));
    disconnect.mockClear();
    await user.click(screen.getByRole('button', { name: 'TEXT' }));
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it('confirms a destructive coach switch while preserving the mode controls', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /reed.*select coach/i }));
    await user.click(screen.getByRole('button', { name: 'IRIS' }));
    expect(screen.getByRole('alertdialog')).toHaveTextContent(/switch to iris/i);
    await user.click(screen.getByRole('button', { name: /switch coach/i }));
    expect(screen.getByAltText(/iris, selected delirio coach/i)).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
    expect(clearMessages).toHaveBeenCalled();
  });

  it('filters the production FAQ content and opens only the first item', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('button', { name: /is this actually ai or a set of canned responses/i })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'About the price' }));
    expect(screen.getByRole('button', { name: /why pay \$30\/month/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /can i cancel anytime/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /can the ai actually see my form/i })).not.toBeInTheDocument();
  });

  it('presents problem recognition before the product mechanism and keeps medical claims bounded', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.queryByRole('heading', { name: /less starting over.*more knowing what.s next/i })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /delirio coaching experience/i })).toBeInTheDocument();
    const problemBand = screen.getByRole('region', { name: /when staying fit feels harder/i });
    const painPoints = within(problemBand).getAllByRole('article');
    expect(painPoints).toHaveLength(4);
    expect(painPoints.every((painPoint) => painPoint.querySelector('svg[aria-hidden="true"]'))).toBe(true);
    expect(problemBand).toHaveTextContent(/energy and strength changes.*adjusts the plan/i);
    expect(problemBand).toHaveTextContent(/motivation drops.*motivational reminders.*purpose/i);
    expect(problemBand).toHaveTextContent(/time gets squeezed.*rebuilds the session/i);
    expect(problemBand).toHaveTextContent(/regaining feels overwhelming.*progressive path.*rebuild strength/i);
    expect(problemBand).not.toHaveTextContent(/glp-1 journeys|busy weeks|missed days|the friction delirio removes/i);
    expect(screen.queryByText(/physical wellbeing concerns/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pick it up return with context/i }));
    expect(screen.getByRole('heading', { name: /a missed workout.*not an abandoned plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /one coach.*no appointment to reschedule/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'About the product' }));
    expect(screen.getByRole('button', { name: /strength training while i use a glp-1 medication/i })).toBeInTheDocument();
  });

  it('keeps retired landing-page content out of the rendered journey', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.queryByText(/ask in the moment/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hear what changes/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /clear about what is known/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start the questions/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /start voice session/i })).toBeInTheDocument();
    expect(document.querySelector('.d3-voice-product')).not.toBeInTheDocument();
  });

  it('offers a direct pricing contact option', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'contact@delirio.fit' })).toHaveAttribute('href', 'mailto:contact@delirio.fit');
  });

  it('links How it works directly to the product journey carousel', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /how it works/i })).toHaveAttribute('href', '#how-it-works');
    const problemBand = document.querySelector('.d3-problem-band');
    const fadeTransition = document.querySelector('.d3-section-fade--dark-to-light');
    const carousel = document.getElementById('how-it-works');
    const coachStudio = document.getElementById('session');
    expect(carousel).toHaveClass('d3-plan-live');
    expect(carousel).toHaveAttribute('data-theme', 'light');
    expect(fadeTransition).not.toBeNull();
    expect(fadeTransition).toHaveAttribute('aria-hidden', 'true');
    expect(Boolean((problemBand?.compareDocumentPosition(fadeTransition as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean((fadeTransition?.compareDocumentPosition(carousel as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean((carousel?.compareDocumentPosition(coachStudio as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(document.querySelector('.d3-wheel-transition')).not.toBeInTheDocument();
  });

  it('opens the questionnaire overlay from the default hero', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    await user.click(screen.getByRole('button', { name: /take a quiz/i }));
    expect(screen.getByRole('dialog', { name: /is a glp-1 medication/i })).toBeInTheDocument();
  });

  it('starts a new questionnaire run each time the hero action opens it', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);
    const launchButton = screen.getByRole('button', { name: /take a quiz/i });

    await user.click(launchButton);
    await user.click(screen.getByRole('radio', { name: 'No' }));
    await user.click(screen.getByRole('button', { name: /close questionnaire/i }));
    await screen.findByRole('button', { name: /take a quiz/i });

    await user.click(launchButton);
    expect(screen.getByLabelText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked();
  });
});
