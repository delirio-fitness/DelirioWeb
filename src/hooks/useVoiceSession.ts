import { useCallback, useEffect, useRef, useState } from "react";
import { PipecatClient, TransportState } from "@pipecat-ai/client-js";
import { DailyTransport } from "@pipecat-ai/daily-transport";
import { generateDiscoveryId, PIPECAT_BACKEND_URL } from "../utils/pipecatConfig";

export type VoiceSessionState = "idle" | "connecting" | "connected" | "error";

interface UseVoiceSessionOptions {
  personality?: string;
  userId?: string;
  context?: string;
  /** Connection timeout in ms (default: 30000) */
  timeout?: number;
  /** Max retry attempts on connection failure (default: 3) */
  maxRetries?: number;
}

export function useVoiceSession(options: UseVoiceSessionOptions = {}) {
  const {
    personality = "reed", // within default_app context, "reed" and "iris" are functional
    userId = generateDiscoveryId(),
    context = "discovery", //default_app is funcitonal 
    timeout = 30000,
    maxRetries = 3,

  } = options; 


  const [sessionState, setSessionState] = useState<VoiceSessionState>("idle");
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [botTranscript, setBotTranscript] = useState("");
  const [botTurns, setBotTurns] = useState<string[]>([]);
  const [userTranscript, setUserTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [transportState, setTransportState] = useState<string>("idle");

  const clientRef = useRef<PipecatClient | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const retryCountRef = useRef(0);
  const isConnectingRef = useRef(false);
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
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current.srcObject = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.muted = isSpeakerMuted;
    }
  }, [isSpeakerMuted]);

  useEffect(() => {
    if (sessionState !== "connected" || !clientRef.current) {
      return;
    }

    clientRef.current.enableMic(!isMicMuted);
  }, [isMicMuted, sessionState]);

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

  const commitPendingBotTurn = useCallback((reason: "stopped" | "rolled" | "disconnected") => {
    const finalized = pendingBotTurnRef.current.trim();
    if (!finalized) {
      return;
    }

    // Keep only the latest completed bot turn in the rendered transcript.
    setBotTurns([finalized]);
    console.log(`[VoiceSession] Committed bot turn (${reason}):`, finalized);
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
    setBotTurns([]);
    resetPendingBotTurn();
    resetPendingUserTranscript();
  }, [personality, resetPendingBotTurn, resetPendingUserTranscript]);

  // Use refs to avoid circular dependency issues with retry logic
  const connectWithRetryRef = useRef<(attempt: number) => Promise<void>>();

  const handleConnectionError = useCallback((errorMsg: string, attempt: number) => {
    isConnectingRef.current = false;

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
      console.log(`[VoiceSession] Retrying in ${delay}ms (attempt ${attempt + 2}/${maxRetries})...`);

      retryCountRef.current = attempt + 1;
      setTimeout(() => {
        connectWithRetryRef.current?.(attempt + 1);
      }, delay);
    } else {
      console.error(`[VoiceSession] Connection failed after ${attempt + 1} attempts: ${errorMsg}`);
      setError(errorMsg);
      setSessionState("error");
      retryCountRef.current = 0;
    }
  }, [maxRetries]);

  const connectWithRetry = useCallback(async (attempt: number = 0): Promise<void> => {
    if (clientRef.current?.connected || isConnectingRef.current) return;

    isConnectingRef.current = true;
    setSessionState("connecting");
    setError(null);

    // Prime audio element inside user gesture so browsers allow playback
    const audio = getAudioElement();
    audio.play().catch(() => {});

    const t0 = Date.now();
    const ms = () => `+${Date.now() - t0}ms`;
    const sessionTag = `personality="${personality}" context="${context}" userId="${userId}"`;

    console.log(`[VoiceSession] ---- NEW SESSION ----`);
    console.log(`[VoiceSession] Config: ${sessionTag}`);

    try {
      const transport = new DailyTransport();
      const client = new PipecatClient({
        transport,
        enableMic: true,
        enableCam: false,
        // TODO: `timeout` is honored at runtime but missing from PipecatClientOptions in @pipecat-ai/client-js typings.
        // @ts-expect-error -- runtime-supported option not in SDK type definitions
        timeout,
        callbacks: {
          onConnected: () => {
            console.log(`[VoiceSession] (${ms()}) Connected to transport`);
          },
          onDisconnected: () => {
            console.warn(`[VoiceSession] (${ms()}) Disconnected — ${sessionTag}`);
            commitPendingBotTurn("disconnected");
            setSessionState("idle");
            setIsBotSpeaking(false);
            setIsUserSpeaking(false);
            isConnectingRef.current = false;
          },
          onTransportStateChanged: (state: TransportState) => {
            console.log(`[VoiceSession] (${ms()}) Transport: ${state}`);
            setTransportState(state);
          },
          onBotReady: () => {
            console.log(`[VoiceSession] (${ms()}) Bot ready — session fully connected`);
            setSessionState("connected");
            retryCountRef.current = 0;
            isConnectingRef.current = false;
          },
          onBotStartedSpeaking: () => {
            console.log(`[VoiceSession] (${ms()}) Bot started speaking`);
            commitPendingBotTurn("rolled");
            resetPendingBotTurn();
            setIsBotSpeaking(true);
          },
          onBotStoppedSpeaking: () => {
            console.log(`[VoiceSession] (${ms()}) Bot stopped speaking`);
            setIsBotSpeaking(false);
            commitPendingBotTurn("stopped");
          },
          onUserStartedSpeaking: () => {
            resetPendingUserTranscript();
            setIsUserSpeaking(true);
          },
          onUserStoppedSpeaking: () => setIsUserSpeaking(false),
          onBotLlmText: (data: any) => {
            // Streaming bot output during the active turn.
            const text = typeof data === "string" ? data : data?.text ?? "";
            if (text) {
              appendPendingBotTurn("llm", text);
            }
          },
          onBotTtsText: (data: any) => {
            // TTS text stream; used when no LLM token stream is available.
            const text = typeof data === "string" ? data : data?.text ?? "";
            if (text) {
              appendPendingBotTurn("tts", text);
            }
          },
          onBotLlmStarted: () => {
            // Start a fresh turn; preserve any text from an unclosed previous turn.
            commitPendingBotTurn("rolled");
            resetPendingBotTurn();
          },
          onBotTranscript: (data) => {
            // Deprecated fallback — only fires if above events don't
          //  if (data.text) setBotTranscript(data.text);
          },
          onUserTranscript: (data) => {
            const text = typeof data === "string" ? data : data?.text ?? "";
            if (text) {
              appendPendingUserTranscript(text);
            }

            if (data?.text && data?.final) {
              const cleanUserText = stripInlineMarkup(data.text);
              console.log("[VoiceSession] User transcript (final):", cleanUserText);
              pendingUserTranscriptRef.current = cleanUserText;
              setUserTranscript(cleanUserText);
            }
          },
          onTrackStarted: (track, participant) => {
            console.log(`[VoiceSession] (${ms()}) Track: ${track.kind}, local=${participant?.local}`);
            if (track.kind === "audio" && participant && !participant.local) {
              const audio = getAudioElement();
              const stream = new MediaStream([track]);
              audio.srcObject = stream;
              audio.muted = isSpeakerMuted;
              audio.play().catch((e) =>
                console.warn("[VoiceSession] Audio play blocked:", e)
              );
              console.log("[VoiceSession] Remote audio track attached");
            }
          },
          onError: (message) => {
            //log General message: 
            console.log("General error message: ", message)
            console.error(`[VoiceSession] (${ms()}) ERROR — ${sessionTag}`);
            console.error("[VoiceSession] Error payload:", {
              label: message?.label,
              type: message?.type,
              data: message?.data,
              id: message?.id,
            });
            const data = message?.data;
            const errorMsg =
              (typeof data === "object" && data !== null ? (data as any).message : null)
              ?? (typeof data === "string" ? data : null)
              ?? (typeof message === "string" ? message : JSON.stringify(message))
              ?? "Connection error";
            console.error(`[VoiceSession] Extracted error: "${errorMsg}"`);
            handleConnectionError(errorMsg, attempt);
          },
        },
      });

      clientRef.current = client;

      const connectUrl = `${PIPECAT_BACKEND_URL}/connect`;
      const requestBody = { user_id: userId, personality, context };

      console.log(`[VoiceSession] Attempting connection (attempt ${attempt + 1}/${maxRetries})...`);
      console.log(`[VoiceSession] Endpoint: ${connectUrl}`);
      console.log(`[VoiceSession] Request body:`, requestBody);

      await client.startBotAndConnect({
        endpoint: connectUrl,
        requestData: requestBody,
        // TODO: `config` is honored at runtime but missing from APIRequest in @pipecat-ai/client-js typings.
        // @ts-expect-error -- runtime-supported field not in SDK type definitions
        config:[
          {
            service: "llm", 
            options:[
              {
                name: "messages",
                 value: [
                  {role: "system", content: "Always refer to the user as ANDY"}
                 ]
              }
            ]
          }
        ]
      });
      console.log("Endpoint in use: ", connectUrl) //logging 
    } catch (err) {
      console.error("[VoiceSession] Connection error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to connect";
      handleConnectionError(errorMsg, attempt);
    }
  }, [
    personality,
    userId,
    context,
    timeout,
    maxRetries,
    handleConnectionError,
    getAudioElement,
    isSpeakerMuted,
    appendPendingBotTurn,
    appendPendingUserTranscript,
    commitPendingBotTurn,
    resetPendingBotTurn,
    resetPendingUserTranscript,
    stripInlineMarkup,
  ]);

  // Keep the ref updated
  useEffect(() => {
    connectWithRetryRef.current = connectWithRetry;
  }, [connectWithRetry]);

  const connect = useCallback(async () => {
    retryCountRef.current = 0;
    setBotTurns([]);
    resetPendingBotTurn();
    resetPendingUserTranscript();
    await connectWithRetry(0);
  }, [connectWithRetry, resetPendingBotTurn, resetPendingUserTranscript]);

  const disconnect = useCallback(async () => {
    isConnectingRef.current = false;
    retryCountRef.current = 0;
    commitPendingBotTurn("disconnected");
    if (!clientRef.current) return;
    try {
      await clientRef.current.disconnect();
    } catch (err) {
      console.error("[VoiceSession] Disconnect error:", err);
    }
    clientRef.current = null;
    setSessionState("idle");
    setTransportState("idle");
  }, [commitPendingBotTurn]);

  const toggleMic = useCallback(() => {
    setIsMicMuted((currentState) => {
      const nextState = !currentState;
      clientRef.current?.enableMic(!nextState);
      return nextState;
    });
  }, []);

  const toggleSpeakerMute = useCallback(() => {
    setIsSpeakerMuted((currentState) => {
      const nextState = !currentState;
      if (audioElementRef.current) {
        audioElementRef.current.muted = nextState;
      }
      return nextState;
    });
  }, []);

  const updateMic = useCallback((deviceId: string) => {
    clientRef.current?.updateMic(deviceId);
  }, []);

  const updateSpeaker = useCallback((deviceId: string) => {
    clientRef.current?.updateSpeaker(deviceId);
  }, []);

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
    transportState,
    isMicMuted,
    isSpeakerMuted,
    isBotSpeaking,
    isUserSpeaking,
    botTranscript,
    botTurns,
    userTranscript,
    error,
    connect,
    disconnect,
    toggleMic,
    toggleSpeakerMute,
    updateMic,
    updateSpeaker,
  };
}
