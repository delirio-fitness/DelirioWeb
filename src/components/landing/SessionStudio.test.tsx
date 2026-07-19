import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionStudio, type SessionMode } from './SessionStudio';
import type { VoiceFailureKind, VoiceSessionState } from '../../hooks/useVoiceSession';

function renderStudio({ selectedCoach = 'reed' as 'reed' | 'iris' | null, mode = 'voice' as SessionMode, state = 'idle' as VoiceSessionState, failureKind = null as VoiceFailureKind | null } = {}) {
  const onModeChange = jest.fn();
  const onStart = jest.fn();
  const onRetry = jest.fn();
  const onSelectCoach = jest.fn();
  render(
    <SessionStudio
      selectedCoach={selectedCoach}
      onSelectCoach={onSelectCoach}
      mode={mode}
      onModeChange={onModeChange}
      voice={{
        sessionState: state,
        isMicMuted: false,
        isSpeakerMuted: false,
        isBotSpeaking: false,
        isBotProcessing: false,
        isUserSpeaking: false,
        botTranscript: '',
        botTurns: [],
        userTranscript: '',
        failureKind,
        retryAttempt: 0,
        hasEnded: false,
        onStart,
        onCancel: jest.fn(),
        onEnd: jest.fn(),
        onToggleMic: jest.fn(),
        onToggleSpeaker: jest.fn(),
      }}
      text={{
        messages: [],
        input: '',
        isLoading: false,
        error: null,
        failedMessage: null,
        onInputChange: jest.fn(),
        onSubmit: jest.fn(),
        onRetry,
      }}
    />,
  );
  return { onModeChange, onStart, onRetry, onSelectCoach };
}

describe('SessionStudio', () => {
  it('explains microphone use before an explicit start', async () => {
    const user = userEvent.setup();
    const { onStart } = renderStudio();
    expect(screen.getByRole('status')).toHaveTextContent(/ready to connect/i);
    await user.click(screen.getByRole('button', { name: /start voice session/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('keeps the selected coach centered in voice mode', () => {
    renderStudio({ selectedCoach: 'reed', mode: 'voice' });
    expect(screen.getByRole('img', { name: 'Reed, selected AI fitness coach' })).toBeInTheDocument();
  });

  it('keeps the selected coach visible in text mode', () => {
    renderStudio({ selectedCoach: 'iris', mode: 'text' });
    expect(screen.getByRole('img', { name: 'Iris, selected AI fitness coach' })).toBeInTheDocument();
  });

  it('switches coach through the Figma coach controls', async () => {
    const user = userEvent.setup();
    const { onSelectCoach } = renderStudio({ selectedCoach: 'reed', mode: 'voice' });
    await user.click(screen.getByRole('button', { name: 'IRIS' }));
    expect(onSelectCoach).toHaveBeenCalledWith('iris');
  });

  it('shows large selectable coach personalities before a coach is selected', async () => {
    const user = userEvent.setup();
    const { onSelectCoach } = renderStudio({ selectedCoach: null });
    await user.click(screen.getByRole('button', { name: /iris.*select coach/i }));
    expect(onSelectCoach).toHaveBeenCalledWith('iris');
    expect(screen.queryByText(/website preview/i)).not.toBeInTheDocument();
  });

  it('classifies denied microphone access and preserves text fallback', () => {
    renderStudio({ state: 'error', failureKind: 'permission-denied' });
    expect(screen.getByRole('alert')).toHaveTextContent(/microphone access blocked/i);
    expect(screen.getByRole('button', { name: 'TEXT' })).toBeInTheDocument();
  });

  it('shows recoverable text failure', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(
      <SessionStudio
        selectedCoach="iris"
        onSelectCoach={jest.fn()}
        mode="text"
        onModeChange={jest.fn()}
        voice={{ sessionState: 'idle', isMicMuted: false, isSpeakerMuted: false, isBotSpeaking: false, isBotProcessing: false, isUserSpeaking: false, botTranscript: '', botTurns: [], userTranscript: '', failureKind: null, retryAttempt: 0, hasEnded: false, onStart: jest.fn(), onCancel: jest.fn(), onEnd: jest.fn(), onToggleMic: jest.fn(), onToggleSpeaker: jest.fn() }}
        text={{ messages: [{ role: 'user', text: 'Help me train' }], input: '', isLoading: false, error: 'Network error', failedMessage: 'Help me train', onInputChange: jest.fn(), onSubmit: jest.fn(), onRetry }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/message failed/i);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
