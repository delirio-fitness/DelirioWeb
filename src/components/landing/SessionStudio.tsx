import { useEffect, useRef, type FormEvent, type RefObject } from 'react';
import type { ChatMessage, TextConnectionState } from '../../hooks/useTextChat';
import type { VoiceFailureKind, VoiceSessionState } from '../../hooks/useVoiceSession';
import { coachProfiles, type CoachId } from '../../content/landingContent';
import { VoiceFrequencyWaveform } from './VoiceFrequencyWaveform';

export type SessionMode = 'voice' | 'text';

const failureMessages: Record<VoiceFailureKind, string> = {
  'permission-denied': 'MICROPHONE ACCESS BLOCKED',
  'device-unavailable': 'MICROPHONE UNAVAILABLE',
  timeout: 'CONNECTION TIMED OUT',
  network: 'NETWORK INTERRUPTED',
  connection: 'CONNECTION FAILED',
  unknown: 'SESSION INTERRUPTED',
};

type Props = {
  selectedCoach: CoachId | null;
  onSelectCoach: (coach: CoachId) => void;
  mode: SessionMode;
  onModeChange: (mode: SessionMode) => void;
  voice: {
    sessionState: VoiceSessionState;
    isBotSpeaking: boolean;
    isBotProcessing: boolean;
    isUserSpeaking: boolean;
    botTranscript: string;
    botTurns: string[];
    userTranscript: string;
    failureKind: VoiceFailureKind | null;
    frequencyLevels: readonly number[];
    isFrequencyListening: boolean;
    hasEnded: boolean;
    onStart: () => void;
    onCancel: () => void;
    onEnd: () => void;
  };
  text: {
    messages: ChatMessage[];
    input: string;
    isLoading: boolean;
    connectionState: TextConnectionState;
    error: string | null;
    onInputChange: (value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
    onRetry: () => void;
  };
};

export function SessionStudio({ selectedCoach, onSelectCoach, mode, onModeChange, voice, text }: Props) {
  const chatRef = useRef<HTMLDivElement>(null);
  const coach = selectedCoach ? coachProfiles[selectedCoach] : null;

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [text.messages, text.isLoading]);

  return (
    <section id="session" className={`coach-trial coach-trial--${mode}`} aria-labelledby="coach-trial-title">
      <span id="coaches" className="coach-trial__anchor" aria-hidden="true" />
      <div className="coach-trial__intro">
        <h2 id="coach-trial-title">CHOOSE A COACH.<br />THEN TALK OR TYPE.</h2>
        <p className="coach-trial__body">Start with the relationship, not a control panel. Pick Iris or Reed first. Delirio then shows one communication mode at a time.</p>
      </div>

      <div className={`coach-trial__panel ${coach ? '' : 'coach-trial__panel--choose'}`}>
        {!coach ? (
          <ChooseCoach onSelectCoach={onSelectCoach} />
        ) : (
          <>
            <TrialControls coach={coach.id} mode={mode} onSelectCoach={onSelectCoach} onModeChange={onModeChange} />
            {mode === 'voice' ? <VoiceStage key={coach.id} coach={coach} voice={voice} /> : <TextStage key={coach.id} coach={coach} text={text} chatRef={chatRef} />}
          </>
        )}
      </div>
    </section>
  );
}

function ChooseCoach({ onSelectCoach }: { onSelectCoach: (coach: CoachId) => void }) {
  return <>
    <p className="coach-trial__step">1 / CHOOSE A COACH</p>
    <h3 className="coach-trial__question">WHO SHOULD COACH YOU?</h3>
    <div className="coach-trial__choices">
      {(['iris', 'reed'] as const).map((id) => {
        const coach = coachProfiles[id];
        const descriptor = id === 'iris' ? 'RELATIONAL / ATTENTIVE' : 'FOCUSED / DIRECT';
        return <button className="coach-trial__card" key={id} type="button" onClick={() => onSelectCoach(id)}>
          <img src={coach.avatar} alt="" />
          <span><b>{coach.name.toUpperCase()}</b><small>{descriptor}</small></span>
          <u>SELECT COACH →</u>
        </button>;
      })}
    </div>
  </>;
}

function TrialControls({ coach, mode, onSelectCoach, onModeChange }: { coach: CoachId; mode: SessionMode; onSelectCoach: (coach: CoachId) => void; onModeChange: (mode: SessionMode) => void }) {
  return <div className="coach-trial__controls">
    <div className="coach-trial__coach-tabs" role="group" aria-label="Choose coach">
      {(['iris', 'reed'] as const).map((id) => <button key={id} type="button" aria-pressed={coach === id} onClick={() => onSelectCoach(id)}><img src={coachProfiles[id].avatar} alt="" /><span>{coachProfiles[id].name.toUpperCase()}</span></button>)}
    </div>
    <div className="coach-trial__mode-tabs" role="group" aria-label="Choose communication mode">
      {(['voice', 'text'] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => onModeChange(value)}>{value.toUpperCase()}</button>)}
    </div>
  </div>;
}

function VoiceStage({ coach, voice }: { coach: (typeof coachProfiles)[CoachId]; voice: Props['voice'] }) {
  let status = 'READY TO CONNECT';
  if (voice.sessionState === 'connecting') status = '…CONNECTING';
  if (voice.sessionState === 'connected') {
    if (voice.isUserSpeaking) status = 'LISTENING TO YOU';
    else if (voice.isBotSpeaking) status = `${coach.name.toUpperCase()} IS SPEAKING`;
    else if (voice.isBotProcessing) status = 'THINKING';
    else status = 'CONNECTED';
  }
  if (voice.sessionState === 'error') status = failureMessages[voice.failureKind ?? 'unknown'];
  if (voice.hasEnded && voice.sessionState === 'idle') status = 'SESSION ENDED';

  const transcript = [...voice.botTurns, voice.botTranscript].filter(Boolean).at(-1) || voice.userTranscript;

  return <div className={`coach-trial__stage coach-trial__stage--voice coach-trial__mode-content ${voice.isBotSpeaking ? 'is-coach-speaking' : ''}`}>
    {(voice.sessionState === 'connecting' || voice.sessionState === 'connected') && <div className="coach-trial__voice-presence" aria-hidden="true">
      <VoiceFrequencyWaveform levels={voice.frequencyLevels} isListening={voice.isFrequencyListening} />
    </div>}
    <img className="coach-trial__stage-portrait" src={coach.avatar} alt={`${coach.name}, selected AI fitness coach`} />
    <div className="coach-trial__voice-content">
      <p className="coach-trial__session-label">{coach.name.toUpperCase()} / VOICE SESSION</p>
      <h3 role={voice.sessionState === 'error' ? 'alert' : 'status'}>{status}</h3>
      {transcript && <p className="coach-trial__transcript">{transcript}</p>}
      <div className="coach-trial__voice-actions">
        {(voice.sessionState === 'idle' || voice.sessionState === 'error') && <span>VOICE REQUIRES MICROPHONE ACCESS</span>}
        {voice.sessionState === 'connected' ? <button type="button" onClick={voice.onEnd}>END SESSION</button> : voice.sessionState === 'connecting' ? <button type="button" onClick={voice.onCancel}>CANCEL</button> : voice.sessionState === 'error' ? <button type="button" onClick={voice.onStart}>TRY AGAIN</button> : null}
      </div>
    </div>
  </div>;
}

function TextStage({ coach, text, chatRef }: { coach: (typeof coachProfiles)[CoachId]; text: Props['text']; chatRef: RefObject<HTMLDivElement> }) {
  const hasConnectionStatus = text.connectionState !== 'idle' || Boolean(text.error);

  return <div className="coach-trial__stage coach-trial__stage--text coach-trial__mode-content">
    <div className="coach-trial__text-content">
      <div className="coach-trial__text-header">
        <img className="coach-trial__stage-portrait" src={coach.avatar} alt={`${coach.name}, selected AI fitness coach`} />
        <p className="coach-trial__session-label">{coach.name.toUpperCase()} / WEB CHAT</p>
      </div>
      <div className="coach-trial__message-viewport">
        <p className={`coach-trial__chat-ghost ${text.messages.length ? 'is-hidden' : ''}`} aria-hidden={text.messages.length > 0}>...coaches are here to support, guide, and instruct. Ask anything…</p>
        {text.messages.length || hasConnectionStatus ? <div ref={chatRef} className="coach-trial__messages" aria-live="polite">
          {text.messages.map((message, index) => <p className={message.role} key={`${message.role}-${index}`}><b>{message.role === 'user' ? 'YOU' : coach.name.toUpperCase()}</b>{message.text}</p>)}
          {text.error ? <p className="coach-trial__connection-status is-error" role="alert">CONNECTION FAILED · <button type="button" onClick={text.onRetry}>RETRY</button></p> : text.connectionState === 'responding' ? <p className="coach-trial__connection-status">{coach.name.toUpperCase()} IS RESPONDING…</p> : text.connectionState === 'connecting' ? <p className="coach-trial__connection-status">CONNECTING…</p> : null}
        </div> : null}
      </div>
      <form className="coach-trial__chat-form" onSubmit={text.onSubmit}>
        <input aria-label={`Message ${coach.name}`} value={text.input} onChange={(event) => text.onInputChange(event.target.value)} placeholder="TYPE A MESSAGE…" disabled={text.isLoading} autoComplete="off" />
        <button type="submit" aria-label="Send message" disabled={text.isLoading || !text.input.trim()}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </button>
      </form>
    </div>
  </div>;
}
