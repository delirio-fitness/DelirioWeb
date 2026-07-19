import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const disconnect = jest.fn();
const clearMessages = jest.fn();

jest.mock('../utils/pipecatConfig', () => ({
  generateDiscoveryId: () => 'test-session',
}));

jest.mock('../hooks/useVoiceSession', () => ({
  useVoiceSession: () => ({
    sessionState: 'idle',
    isMicMuted: false,
    isSpeakerMuted: false,
    isBotSpeaking: false,
    isBotProcessing: false,
    isUserSpeaking: false,
    botTranscript: '',
    botTurns: [],
    userTranscript: '',
    failureKind: null,
    retryAttempt: 0,
    connect: jest.fn(),
    disconnect,
    cancelConnect: disconnect,
    toggleMic: jest.fn(),
    toggleSpeakerMute: jest.fn(),
  }),
}));

jest.mock('../hooks/useTextChat', () => ({
  useTextChat: () => ({
    messages: [{ role: 'user', text: 'Existing preview' }],
    isLoading: false,
    error: null,
    failedMessage: null,
    sendMessage: jest.fn(),
    retryLastMessage: jest.fn(),
    clearMessages,
  }),
}));

import Landing from './Landing';

describe('Landing journey', () => {
  it('requires coach choice and opens the selected coach preview', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('heading', { name: /choose a coach.*then talk or type/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /reed.*select coach/i }));
    expect(screen.getByAltText(/reed, selected ai fitness coach/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start voice session/i })).toBeInTheDocument();
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
