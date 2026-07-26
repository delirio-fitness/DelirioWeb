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
        isBotSpeaking: false,
        isBotProcessing: false,
        isUserSpeaking: false,
        botTranscript: '',
        botTurns: [],
        userTranscript: '',
        failureKind,
        frequencyLevels: Array(16).fill(0),
        isFrequencyListening: false,
        hasEnded: false,
        onStart,
        onCancel: jest.fn(),
        onEnd: jest.fn(),
      }}
      text={{
        messages: [],
        input: '',
        isLoading: false,
        connectionState: 'idle',
        error: null,
        onInputChange: jest.fn(),
        onSubmit: jest.fn(),
        onRetry,
      }}
    />,
  );
  return { onModeChange, onStart, onRetry, onSelectCoach };
}

describe('SessionStudio', () => {
  it('shows automatic voice readiness without a manual start action', () => {
    renderStudio();
    expect(screen.getByRole('status')).toHaveTextContent(/ready to connect/i);
    expect(screen.queryByRole('button', { name: /start voice session/i })).not.toBeInTheDocument();
  });

  it('keeps retry attempts behind a single connecting state', () => {
    renderStudio({ state: 'connecting' });
    expect(screen.getByRole('status')).toHaveTextContent('…CONNECTING');
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('offers manual retry only after automatic connection attempts fail', () => {
    renderStudio({ state: 'error', failureKind: 'connection' });
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('keeps the selected coach centered in voice mode', () => {
    renderStudio({ selectedCoach: 'reed', mode: 'voice' });
    const portrait = screen.getByRole('img', { name: 'Reed, selected Delirio coach' });
    expect(portrait).toBeInTheDocument();
    expect(portrait.parentElement).toHaveClass('coach-trial__stage--voice', 'coach-trial__mode-content');
  });

  it('keeps the selected coach visible in text mode', () => {
    renderStudio({ selectedCoach: 'iris', mode: 'text' });
    const portrait = screen.getByRole('img', { name: 'Iris, selected Delirio coach' });
    expect(portrait).toBeInTheDocument();
    expect(portrait.closest('.coach-trial__stage')).toHaveClass('coach-trial__stage--text', 'coach-trial__mode-content');
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
        voice={{ sessionState: 'idle', isBotSpeaking: false, isBotProcessing: false, isUserSpeaking: false, botTranscript: '', botTurns: [], userTranscript: '', failureKind: null, frequencyLevels: Array(16).fill(0), isFrequencyListening: false, hasEnded: false, onStart: jest.fn(), onCancel: jest.fn(), onEnd: jest.fn() }}
        text={{ messages: [{ role: 'user', text: 'Help me train' }], input: '', isLoading: false, connectionState: 'idle', error: 'Network error', onInputChange: jest.fn(), onSubmit: jest.fn(), onRetry }}
      />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent(/connection failed/i);
    await user.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
