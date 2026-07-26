jest.mock('../utils/pipecatConfig', () => ({
  PIPECAT_BACKEND_URL: 'https://voice.example.com',
  generateDiscoveryId: () => 'test-user',
}));
jest.mock('@pipecat-ai/client-js', () => ({ PipecatClient: jest.fn() }));
jest.mock('@pipecat-ai/daily-transport', () => ({ DailyTransport: jest.fn() }));

import { act, renderHook, waitFor } from '@testing-library/react';
import { PipecatClient } from '@pipecat-ai/client-js';
import { classifyVoiceFailure, useVoiceSession, VOICE_CONNECTION_STABILITY_MS } from './useVoiceSession';

type Callback = (...args: never[]) => void;

const mockedPipecatClient = jest.mocked(PipecatClient);

let callbacks: Record<string, Callback>;
let mockClient: {
  connected: boolean;
  disconnect: jest.Mock<Promise<void>, []>;
  enableMic: jest.Mock;
  startBotAndConnect: jest.Mock<Promise<void>, [unknown]>;
  updateMic: jest.Mock;
  updateSpeaker: jest.Mock;
};
let mockAudio: {
  autoplay: boolean;
  muted: boolean;
  pause: jest.Mock;
  play: jest.Mock<Promise<void>, []>;
  srcObject: MediaStream | null;
};

beforeEach(() => {
  callbacks = {};
  mockClient = {
    connected: false,
    disconnect: jest.fn().mockResolvedValue(undefined),
    enableMic: jest.fn(),
    startBotAndConnect: jest.fn().mockResolvedValue(undefined),
    updateMic: jest.fn(),
    updateSpeaker: jest.fn(),
  };
  mockAudio = {
    autoplay: false,
    muted: false,
    pause: jest.fn(),
    play: jest.fn().mockResolvedValue(undefined),
    srcObject: null,
  };

  Object.defineProperty(globalThis, 'Audio', {
    configurable: true,
    value: jest.fn(() => mockAudio),
  });
  Object.defineProperty(globalThis, 'MediaStream', {
    configurable: true,
    value: jest.fn((tracks: MediaStreamTrack[]) => ({ tracks })),
  });

  mockedPipecatClient.mockImplementation(((configuration: { callbacks: Record<string, Callback> }) => {
    callbacks = configuration.callbacks;
    return mockClient;
  }) as never);

  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('classifyVoiceFailure', () => {
  it.each([
    ['Permission denied by browser', 'permission-denied'],
    ['Microphone device not found', 'device-unavailable'],
    ['Timed out', 'timeout'],
    ['Network failed to fetch', 'network'],
    ['Connection unavailable', 'connection'],
    ['Unexpected', 'unknown'],
  ] as const)('maps %s to %s', (message, expected) => {
    expect(classifyVoiceFailure(message)).toBe(expected);
  });
});

describe('useVoiceSession', () => {
  it('connects, responds to transport callbacks, and controls session devices', async () => {
    jest.useFakeTimers();
    const { result, unmount } = renderHook(() => useVoiceSession({
      personality: 'iris',
      userId: 'user-42',
      context: 'landing-preview',
      maxRetries: 1,
    }));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.sessionState).toBe('connecting');
    expect(mockClient.startBotAndConnect).toHaveBeenCalledWith({
      endpoint: 'https://voice.example.com/connect',
      requestData: { user_id: 'user-42', personality: 'iris', context: 'landing-preview' },
    });
    expect(mockAudio.play).toHaveBeenCalled();

    act(() => {
      callbacks.onTransportStateChanged('ready' as never);
      callbacks.onBotReady();
    });

    expect(result.current.sessionState).toBe('connecting');
    act(() => jest.advanceTimersByTime(VOICE_CONNECTION_STABILITY_MS));
    expect(result.current.sessionState).toBe('connected');
    expect(result.current.transportState).toBe('ready');

    act(() => result.current.toggleMic());
    expect(result.current.isMicMuted).toBe(true);
    expect(mockClient.enableMic).toHaveBeenCalledWith(false);

    act(() => result.current.toggleSpeakerMute());
    expect(result.current.isSpeakerMuted).toBe(true);
    expect(mockAudio.muted).toBe(true);

    act(() => {
      result.current.updateMic('mic-2');
      result.current.updateSpeaker('speaker-2');
    });
    expect(mockClient.updateMic).toHaveBeenCalledWith('mic-2');
    expect(mockClient.updateSpeaker).toHaveBeenCalledWith('speaker-2');

    await act(async () => {
      await result.current.disconnect();
    });
    expect(mockClient.disconnect).toHaveBeenCalled();
    expect(result.current.sessionState).toBe('idle');

    mockClient.connected = true;
    unmount();
    expect(mockClient.disconnect).toHaveBeenCalledTimes(1);
    expect(mockAudio.pause).toHaveBeenCalled();
    expect(mockAudio.srcObject).toBeNull();
  });

  it('assembles bot and user transcript streams without markup or duplicate sources', async () => {
    jest.useFakeTimers();
    const { result } = renderHook(() => useVoiceSession({ maxRetries: 1 }));

    await act(async () => {
      await result.current.connect();
    });

    act(() => {
      callbacks.onBotReady();
      jest.advanceTimersByTime(VOICE_CONNECTION_STABILITY_MS);
      callbacks.onBotLlmStarted();
      callbacks.onBotLlmText({ text: '<voice>Hello ' } as never);
      callbacks.onBotLlmText({ text: 'there</voice>' } as never);
      callbacks.onBotTtsText({ text: 'This duplicate stream is ignored' } as never);
    });
    expect(result.current.botTranscript).toBe('Hello there');

    act(() => callbacks.onBotStoppedSpeaking());
    expect(result.current.botTranscript).toBe('');
    expect(result.current.botTurns).toEqual(['Hello there']);

    act(() => {
      callbacks.onUserStartedSpeaking();
      callbacks.onUserTranscript({ text: '<meta>I need', final: false } as never);
      callbacks.onUserTranscript({ text: 'I need help</meta>', final: false } as never);
    });
    expect(result.current.isUserSpeaking).toBe(true);
    expect(result.current.userTranscript).toBe('I need help');

    act(() => {
      callbacks.onUserTranscript({ text: '<b>Final answer</b>', final: true } as never);
      callbacks.onUserStoppedSpeaking();
    });
    expect(result.current.userTranscript).toBe('Final answer');
    expect(result.current.isUserSpeaking).toBe(false);

    act(() => callbacks.onBotStartedSpeaking());
    expect(result.current.isBotSpeaking).toBe(true);
    act(() => callbacks.onDisconnected());
    expect(result.current.sessionState).toBe('idle');
    expect(result.current.isBotSpeaking).toBe(false);
  });

  it('attaches remote audio and surfaces a non-retriable connection error', async () => {
    const { result } = renderHook(() => useVoiceSession({ maxRetries: 1 }));

    await act(async () => {
      await result.current.connect();
    });

    const remoteTrack = { kind: 'audio' };
    act(() => callbacks.onTrackStarted(remoteTrack as never, { local: false } as never));
    expect(mockAudio.srcObject).toEqual({ tracks: [remoteTrack] });
    expect(mockAudio.play).toHaveBeenCalledTimes(2);

    act(() => callbacks.onError({ data: { message: 'Permission denied' } } as never));
    await waitFor(() => expect(result.current.sessionState).toBe('error'));
    expect(result.current.failureKind).toBe('permission-denied');
    expect(result.current.error).toBe('Permission denied');
  });

  it('classifies rejected connection attempts and supports cancellation before a client exists', async () => {
    mockClient.startBotAndConnect.mockRejectedValueOnce(new Error('Network failed to fetch'));
    const { result } = renderHook(() => useVoiceSession({ maxRetries: 1 }));

    await act(async () => {
      await result.current.connect();
    });

    expect(result.current.sessionState).toBe('error');
    expect(result.current.failureKind).toBe('network');
    expect(result.current.retryAttempt).toBe(0);

    await act(async () => {
      await result.current.cancelConnect();
    });
  });
});
