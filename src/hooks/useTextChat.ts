import { useCallback, useRef, useState } from "react";
import { CHAT_ENGINE_URL, generateDiscoveryId } from "../utils/pipecatConfig";

const isDev = (import.meta as any).env?.DEV;
const CHAT_ENDPOINT = isDev
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

export function useTextChat(options: UseTextChatOptions = {}) {
  const {
    personality = "reed",
    userId = generateDiscoveryId(),
    context = "discovery", 
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      setError(null);
      setMessages((prev) => [...prev, { role: "user", text: trimmed }]);
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

        let data: any;
        try { data = JSON.parse(raw); } catch { data = raw; }
        console.log("[TextChat] Full payload:", data);

        // Deep-parse: recursively JSON.parse any string that looks like JSON
        function deepParse(val: any): any {
          if (typeof val === "string") {
            try {
              const parsed = JSON.parse(val);
              return deepParse(parsed); // recurse in case of double-encoding
            } catch { return val; }
          }
          if (Array.isArray(val)) return val.map(deepParse);
          if (val && typeof val === "object") {
            const out: any = {};
            for (const k of Object.keys(val)) out[k] = deepParse(val[k]);
            return out;
          }
          return val;
        }

        const parsed = deepParse(data);
        console.log("[TextChat] Deep-parsed payload:", parsed);

        // Extract the text from a single message object
        function msgText(m: any): string {
          if (typeof m === "string") return m;
          if (!m || typeof m !== "object") return "";
          return String(m.text ?? m.content ?? m.message ?? m.body ?? "");
        }

        // Find the messages array and pull out non-user replies
        let botReplies: string[] = [];

        // data.messages is the expected shape
        const msgsArr = parsed?.messages ?? parsed?.data?.messages;
        if (Array.isArray(msgsArr)) {
          botReplies = msgsArr
            .filter((m: any) => m.role !== "user")
            .map(msgText)
            .filter((t: string) => t.length > 0);
        }

        // Fallback: single-value response keys
        if (botReplies.length === 0) {
          for (const key of ["response", "reply", "answer", "content", "text"]) {
            const val = parsed?.[key];
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
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        const msg = err instanceof Error ? err.message : "Failed to send message";
        setError(msg);
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
    setIsLoading(false);
  }, []);

  return { messages, isLoading, error, sendMessage, clearMessages };
}
