// Pipecat backend configuration
// Values sourced from devEnv/pipecatSecrets.xml

export const PIPECAT_BACKEND_URL =
  import.meta.env.VITE_PIPECAT_BACKEND_URL ||
  "https://voice-engine-staging.up.railway.app";

export const CHAT_ENGINE_URL =
  import.meta.env.VITE_CHAT_ENGINE_URL ||
  "https://chat-engine-staging.up.railway.app";

export const generateDiscoveryId = () =>
  `discovery_${crypto.randomUUID()}`;
