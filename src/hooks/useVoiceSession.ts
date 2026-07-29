import { useCallback, useEffect, useRef, useState } from "react";
import type { PipecatClient as PipecatClientInstance } from "@pipecat-ai/client-js";
import { generateDiscoveryId, PIPECAT_BACKEND_URL } from "../utils/pipecatConfig";
import { usePipecatFrequencyListener } from "./usePipecatFrequencyListener";

export const VOICE_CONNECTION_STABILITY_MS = 1000;

export type VoiceSessionState = "idle" | "connecting" | "connected" | "error";
export type VoiceFailureKind =
  | "permission-denied"
  | "device-unavailable"
  | "timeout"
  | "network"
  | "connection"
  | "unknown";

export function classifyVoiceFailure(message: string): VoiceFailureKind {
  const normalized = message.toLowerCase();
  if (normalized.includes("notallowed") || normalized.includes("permission") || normalized.includes("denied")) {
    return "permission-denied";
  }
  if (normalized.includes("notfound") || normalized.includes("device") || normalized.includes("microphone")) {
    return "device-unavailable";
  }
  if (normalized.includes("timeout") || normalized.includes("timed out")) {
    return "timeout";
  }
  if (normalized.includes("network") || normalized.includes("failed to fetch")) {
    return "network";
  }
  if (normalized.includes("connection") || normalized.includes("502") || normalized.includes("503")) {
    return "connection";
  }
  return "unknown";
}

function extractText(data: unknown): string {
  if (typeof data === "string") return data;
  if (typeof data === "object" && data !== null && "text" in data) {
    const text = (data as { text?: unknown }).text;
    return typeof text === "string" ? text : "";
  }
  return "";
}

interface UseVoiceSessionOptions {
  personality?: string;
  userId?: string;
  context?: string;
  /** Connection timeout in ms (default: 30000) */
  timeout?: number;
  /** Maximum automatic connection attempts before exposing manual retry (default: 5) */
  maxRetries?: number;
}

export function useVoiceSession(options: UseVoiceSessionOptions = {}) {
  const {
    personality = "reed",
    userId = generateDiscoveryId(),
    context = "discovery",
    timeout = 30000,
    maxRetries = 5,
  } = options;

  const [sessionState, setSessionState] = useState<VoiceSessionState>("idle");
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isBotProcessing, setIsBotProcessing] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [botTranscript, setBotTranscript] = useState("");
  const [botTurns, setBotTurns] = useState<string[]>([]);
  const [userTranscript, setUserTranscript] = useState("");
  const [failureKind, setFailureKind] = useState<VoiceFailureKind | null>(null);
  // Visual-only gain: raises quiet speech motion without changing coach volume.
  const {
    levels: frequencyLevels,
    isListening: isFrequencyListening,
    attachTrack: attachFrequencyTrack,
    detachTrack: detachFrequencyTrack,
  } = usePipecatFrequencyListener({ magnitudeScalar: 1.6, barCount: 16 });

  const clientRef = useRef<PipecatClientInstance | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const isConnectingRef = useRef(false);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stabilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionFailurePendingRef = useRef(false);
  const pendingBotTurnRef = useRef("");
  const pendingBotTurnSourceRef = useRef<"none" | "llm" | "tts">("none");
  const botMarkupTagOpenRef = useRef(false);
  const pendingUserTranscriptRef = useRef("");
  const userMarkupTagOpenRef = useRef(false);

  // Lazily create the audio element (reused across reconnects)
  const getAudioElement = useCallback(() => {
    if (!audioElementRef.current) {
      const audio = new Audio();
      audio.autoplay = true;
      audioElementRef.current = audio;
    }
    return audioElementRef.current;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
      if (stabilityTimerRef.current) clearTimeout(stabilityTimerRef.current);
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      }
    };
  }, []);

  const resetPendingBotTurn = useCallback(() => {
    pendingBotTurnRef.current = "";
    pendingBotTurnSourceRef.current = "none";
    botMarkupTagOpenRef.current = false;
    setBotTranscript("");
  }, []);

  const resetPendingUserTranscript = useCallback(() => {
    pendingUserTranscriptRef.current = "";
    userMarkupTagOpenRef.current = false;
    setUserTranscript("");
  }, []);

  const stripInlineMarkup = useCallback((text: string) => text.replace(/<[^>]*>/g, ""), []);

  const stripStreamingMarkupChunk = useCallback((text: string, channel: "bot" | "user" = "bot") => {
    if (!text) {
      return "";
    }

    let cleaned = "";
    const tagStateRef = channel === "bot" ? botMarkupTagOpenRef : userMarkupTagOpenRef;
    let insideTag = tagStateRef.current;

    for (const character of text) {
      if (insideTag) {
        if (character === ">") {
          insideTag = false;
        }
        continue;
      }

      if (character === "<") {
        insideTag = true;
        continue;
      }

      cleaned += character;
    }

    tagStateRef.current = insideTag;
    return cleaned;
  }, []);

  const commitPendingBotTurn = useCallback(() => {
    const finalized = pendingBotTurnRef.current.trim();
    if (!finalized) {
      return;
    }

    // Keep only the latest completed bot turn in the rendered transcript.
    setBotTurns([finalized]);
    resetPendingBotTurn();
  }, [resetPendingBotTurn]);

  const appendPendingBotTurn = useCallback((source: "llm" | "tts", incomingText: string) => {
    const sanitizedIncomingText = stripStreamingMarkupChunk(incomingText, "bot");
    if (!sanitizedIncomingText) {
      return;
    }

    const currentSource = pendingBotTurnSourceRef.current;
    if (currentSource === "none") {
      pendingBotTurnSourceRef.current = source;
    } else if (currentSource !== source) {
      // Avoid duplicated transcript streams when both LLM and TTS callbacks fire.
      return;
    }

    const currentText = pendingBotTurnRef.current;
    let nextText = currentText;

    if (source === "llm") {
      nextText = currentText + sanitizedIncomingText;
    } else {
      const trimmedIncoming = sanitizedIncomingText.trim();
      const trimmedCurrent = currentText.trim();

      if (trimmedIncoming.length === 0) {
        return;
      }

      if (trimmedCurrent && trimmedIncoming.startsWith(trimmedCurrent)) {
        nextText = trimmedIncoming;
      } else if (trimmedCurrent.endsWith(trimmedIncoming)) {
        return;
      } else if (currentText && !/\s$/.test(currentText) && !/^\s/.test(sanitizedIncomingText)) {
        nextText = `${currentText} ${sanitizedIncomingText}`;
      } else {
        nextText = currentText + sanitizedIncomingText;
      }
    }

    pendingBotTurnRef.current = nextText;
    setBotTranscript(nextText);
  }, [stripStreamingMarkupChunk]);

  const appendPendingUserTranscript = useCallback((incomingText: string) => {
    const sanitizedIncomingText = stripStreamingMarkupChunk(incomingText, "user");
    if (!sanitizedIncomingText) {
      return;
    }

    const currentText = pendingUserTranscriptRef.current;
    const trimmedIncoming = sanitizedIncomingText.trim();
    const trimmedCurrent = currentText.trim();

    if (trimmedIncoming.length === 0) {
      return;
    }

    let nextText = currentText;
    if (trimmedCurrent && trimmedIncoming.startsWith(trimmedCurrent)) {
      nextText = trimmedIncoming;
    } else if (trimmedCurrent.endsWith(trimmedIncoming)) {
      return;
    } else if (currentText && !/\s$/.test(currentText) && !/^\s/.test(sanitizedIncomingText)) {
      nextText = `${currentText} ${sanitizedIncomingText}`;
    } else {
      nextText = currentText + sanitizedIncomingText;
    }

    pendingUserTranscriptRef.current = nextText;
    setUserTranscript(nextText);
  }, [stripStreamingMarkupChunk]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBotTurns([]);
      resetPendingBotTurn();
      resetPendingUserTranscript();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [personality, resetPendingBotTurn, resetPendingUserTranscript]);

  // Use refs to avoid circular dependency issues with retry logic
  const connectWithRetryRef = useRef<(attempt: number) => Promise<void>>();

  const handleConnectionError = useCallback((errorMsg: string, attempt: number) => {
    isConnectingRef.current = false;
    connectionFailurePendingRef.current = true;
    setIsBotProcessing(false);

    // Check if this is a retriable error
    const isRetriable =
      errorMsg.toLowerCase().includes("temporarily unavailable") ||
      errorMsg.toLowerCase().includes("timeout") ||
      errorMsg.toLowerCase().includes("network") ||
      errorMsg.toLowerCase().includes("failed to fetch") ||
      errorMsg.toLowerCase().includes("connection") ||
      errorMsg.toLowerCase().includes("503") ||
      errorMsg.toLowerCase().includes("502");

    if (isRetriable && attempt < maxRetries - 1) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
      retryTimerRef.current = setTimeout(() => {
        retryTimerRef.current = null;
        connectWithRetryRef.current?.(attempt + 1);
      }, delay);
    } else {
      setFailureKind(classifyVoiceFailure(errorMsg));
      setSessionState("error");
    }
  }, [maxRetries]);

  const connectWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    if (clientRef.current?.connected || isConnectingRef.current) return;

    isConnectingRef.current = true;
    connectionFailurePendingRef.current = false;
    setSessionState("connecting");
    setFailureKind(null);

    // Prime audio element inside user gesture so browsers allow playback
    const audio = getAudioElement();
    audio.play().catch(() => {});

    try {
      const [{ PipecatClient }, { DailyTransport }] = await Promise.all([
        import("@pipecat-ai/client-js"),
        import("@pipecat-ai/daily-transport"),
      ]);
      const transport = new DailyTransport();
      const client = new PipecatClient({
        transport,
        enableMic: true,
        enableCam: false,
        // TODO: `timeout` is honored at runtime but missing from PipecatClientOptions in @pipecat-ai/client-js typings.
        // @ts-expect-error -- runtime-supported option not in SDK type definitions
        timeout,
        callbacks: {
          onDisconnected: () => {
            commitPendingBotTurn();
            if (stabilityTimerRef.current) {
              clearTimeout(stabilityTimerRef.current);
              stabilityTimerRef.current = null;
            }
            clientRef.current = null;
            detachFrequencyTrack();
            if (connectionFailurePendingRef.current) return;
            if (isConnectingRef.current) {
              handleConnectionError("Connection dropped before becoming stable", attempt);
              return;
            }
            setSessionState("idle");
            setIsBotSpeaking(false);
            setIsBotProcessing(false);
            setIsUserSpeaking(false);
            isConnectingRef.current = false;
          },
          onBotReady: () => {
            if (stabilityTimerRef.current) clearTimeout(stabilityTimerRef.current);
            stabilityTimerRef.current = setTimeout(() => {
              stabilityTimerRef.current = null;
              if (clientRef.current !== client) return;
              setSessionState("connected");
              setFailureKind(null);
              isConnectingRef.current = false;
            }, VOICE_CONNECTION_STABILITY_MS);
          },
          onBotStartedSpeaking: () => {
            commitPendingBotTurn();
            resetPendingBotTurn();
            setIsBotSpeaking(true);
            setIsBotProcessing(false);
          },
          onBotStoppedSpeaking: () => {
            setIsBotSpeaking(false);
            commitPendingBotTurn();
          },
          onUserStartedSpeaking: () => {
            resetPendingUserTranscript();
            setIsUserSpeaking(true);
          },
          onUserStoppedSpeaking: () => setIsUserSpeaking(false),
          onBotLlmText: (data) => {
            // Streaming bot output during the active turn.
            const text = extractText(data);
            if (text) {
              appendPendingBotTurn("llm", text);
            }
          },
          onBotTtsText: (data) => {
            // TTS text stream; used when no LLM token stream is available.
            const text = extractText(data);
            if (text) {
              appendPendingBotTurn("tts", text);
            }
          },
          onBotLlmStarted: () => {
            // Start a fresh turn; preserve any text from an unclosed previous turn.
            commitPendingBotTurn();
            resetPendingBotTurn();
            setIsBotProcessing(true);
          },
          onUserTranscript: (data) => {
            const text = typeof data === "string" ? data : data?.text ?? "";
            if (text) {
              appendPendingUserTranscript(text);
            }

            if (data?.text && data?.final) {
              const cleanUserText = stripInlineMarkup(data.text);
              pendingUserTranscriptRef.current = cleanUserText;
              setUserTranscript(cleanUserText);
            }
          },
          onTrackStarted: (track, participant) => {
            if (track.kind === "audio" && participant && !participant.local) {
              const audio = getAudioElement();
              const stream = new MediaStream([track]);
              audio.srcObject = stream;
              audio.play().catch(() => {});
              attachFrequencyTrack(track);
            }
          },
          onError: (message) => {
            const data = message?.data;
            const nestedMessage =
              typeof data === "object" && data !== null && "message" in data
                ? (data as { message?: unknown }).message
                : null;
            const errorMsg =
              (typeof nestedMessage === "string" ? nestedMessage : null)
              ?? (typeof data === "string" ? data : null)
              ?? (typeof message === "string" ? message : JSON.stringify(message))
              ?? "Connection error";
            handleConnectionError(errorMsg, attempt);
          },
        },
      });

      clientRef.current = client;

      const connectUrl = `${PIPECAT_BACKEND_URL}/connect`;
      const requestBody = { user_id: userId, personality, context };

      await client.startBotAndConnect({
        endpoint: connectUrl,
        requestData: requestBody,
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect";
      handleConnectionError(errorMsg, attempt);
    }
  }, [
    personality,
    userId,
    context,
    timeout,
    handleConnectionError,
    getAudioElement,
    appendPendingBotTurn,
    appendPendingUserTranscript,
    commitPendingBotTurn,
    resetPendingBotTurn,
    resetPendingUserTranscript,
    stripInlineMarkup,
    attachFrequencyTrack,
    detachFrequencyTrack,
  ]);

  // Keep the ref updated
  useEffect(() => {
    connectWithRetryRef.current = connectWithRetry;
  }, [connectWithRetry]);

  const connect = useCallback(async () => {
    setBotTurns([]);
    setFailureKind(null);
    resetPendingBotTurn();
    resetPendingUserTranscript();
    await connectWithRetry(0);
  }, [connectWithRetry, resetPendingBotTurn, resetPendingUserTranscript]);

  const disconnect = useCallback(async () => {
    isConnectingRef.current = false;
    connectionFailurePendingRef.current = false;
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (stabilityTimerRef.current) {
      clearTimeout(stabilityTimerRef.current);
      stabilityTimerRef.current = null;
    }
    commitPendingBotTurn();
    detachFrequencyTrack();
    if (!clientRef.current) return;
    try {
      await clientRef.current.disconnect();
    } catch {
      // The transport may already be closed; local teardown still proceeds.
    }
    clientRef.current = null;
    setSessionState("idle");
    setIsBotProcessing(false);
  }, [commitPendingBotTurn, detachFrequencyTrack]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clientRef.current?.connected) {
        clientRef.current.disconnect();
      }
    };
  }, []);

  return {
    sessionState,
    isBotSpeaking,
    isBotProcessing,
    isUserSpeaking,
    botTranscript,
    botTurns,
    userTranscript,
    failureKind,
    frequencyLevels,
    isFrequencyListening,
    connect,
    disconnect,
    cancelConnect: disconnect,
  };
}
