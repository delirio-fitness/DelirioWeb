import { useCallback, useRef, useState } from "react";
import { CHAT_ENGINE_URL, generateDiscoveryId } from "../utils/pipecatConfig";
import { IS_DEV } from "../config/runtime";

const CHAT_ENDPOINT = IS_DEV
  ? "/api/chat"                // proxied through Vite dev server (avoids CORS)
  : `${CHAT_ENGINE_URL}/chat`; // direct in production

export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface UseTextChatOptions {
  personality?: string;
  userId?: string;
  context?: string;
}

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function deepParse(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      return deepParse(JSON.parse(value) as unknown);
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) return value.map(deepParse);
  const record = asRecord(value);
  if (!record) return value;
  return Object.fromEntries(Object.entries(record).map(([key, entry]) => [key, deepParse(entry)]));
}

function messageText(value: unknown): string {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (!record) return "";
  for (const key of ["text", "content", "message", "body"]) {
    if (typeof record[key] === "string") return record[key];
  }
  return "";
}

export function useTextChat(options: UseTextChatOptions = {}) {
  const {
    personality = "reed",
    userId = generateDiscoveryId(),
    context = "discovery", 
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string, appendUserMessage = true) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      setFailedMessage(null);
      if (appendUserMessage) {
        setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
      }
      setIsLoading(true);

      abortRef.current = new AbortController();

      try {
        const res = await fetch(CHAT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: abortRef.current.signal,
          body: JSON.stringify({
            userId,
            personality,
            context,
            interface: "web_chat",
            message: trimmed,
          }),
        });

        if (!res.ok) {
          const body = await res.text().catch(() => "");
          throw new Error(body || `Server error ${res.status}`);
        }

        const raw = await res.text();
        console.log("[TextChat] Raw response:", raw);

        let data: unknown;
        try { data = JSON.parse(raw); } catch { data = raw; }
        console.log("[TextChat] Full payload:", data);

        const parsed = deepParse(data);
        console.log("[TextChat] Deep-parsed payload:", parsed);
        const parsedRecord = asRecord(parsed);

        // Find the messages array and pull out non-user replies
        let botReplies: string[] = [];

        // data.messages is the expected shape
        const dataRecord = asRecord(parsedRecord?.data);
        const msgsArr = parsedRecord?.messages ?? dataRecord?.messages;
        if (Array.isArray(msgsArr)) {
          botReplies = msgsArr
            .filter((message) => asRecord(message)?.role !== "user")
            .map(messageText)
            .filter((t: string) => t.length > 0);
        }

        // Fallback: single-value response keys
        if (botReplies.length === 0) {
          for (const key of ["response", "reply", "answer", "content", "text"]) {
            const val = parsedRecord?.[key];
            if (typeof val === "string" && val) {
              botReplies = [val];
              break;
            }
          }
        }

        // Last resort: show raw so bubble is never empty
        if (botReplies.length === 0) {
          botReplies = [raw];
        }

        console.log("[TextChat] Bot replies:", botReplies);

        // Sanitize: if a reply parses into a JSON object, replace with fallback
        botReplies = botReplies.map((reply) => {
          try {
            const parsed = JSON.parse(reply);
            if (parsed !== null && typeof parsed === "object") {
              return "Please respond without special characters";
            }
          } catch {
            // not JSON — that's fine, keep the original string
          }
          return reply;
        });

        setMessages((prev) => [
          ...prev,
          ...botReplies.map((t) => ({ role: "assistant" as const, text: t })),
        ]);
        setFailedMessage(null);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to send message";
        setError(msg);
        setFailedMessage(trimmed);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [personality, userId, context, isLoading]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    setFailedMessage(null);
    setIsLoading(false);
  }, []);

  const retryLastMessage = useCallback(async () => {
    if (!failedMessage || isLoading) return;
    await sendMessage(failedMessage, false);
  }, [failedMessage, isLoading, sendMessage]);

  return {
    messages,
    isLoading,
    error,
    failedMessage,
    sendMessage,
    retryLastMessage,
    clearMessages,
  };
}
