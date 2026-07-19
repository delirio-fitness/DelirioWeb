/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_ENGINE_URL?: string;
  readonly VITE_PIPECAT_BACKEND_URL?: string;
  readonly VITE_TRIGGER_API_KEY?: string;
  readonly VITE_APP_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  const src: string;
  export default src;
}
