import { render, screen } from '@testing-library/react';
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

    expect(screen.getByRole('heading', { name: /choose a coach.*then talk or type/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reed.*select coach/i }));
    expect(screen.getByAltText(/reed, selected ai fitness coach/i)).toBeInTheDocument();
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
    expect(screen.getByAltText(/iris, selected ai fitness coach/i)).toBeInTheDocument();
    expect(disconnect).toHaveBeenCalled();
    expect(clearMessages).toHaveBeenCalled();
  });

  it('filters the production FAQ content and opens only the first item', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('button', { name: /is this actually a real ai/i })).toHaveAttribute('aria-expanded', 'true');
    await user.click(screen.getByRole('button', { name: 'About the price' }));
    expect(screen.getByRole('button', { name: /why pay \$30\/month/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('button', { name: /can i cancel anytime/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /can the ai actually see my form/i })).not.toBeInTheDocument();
  });
});
