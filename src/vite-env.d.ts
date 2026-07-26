/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_ENGINE_URL?: string;
  readonly VITE_PIPECAT_BACKEND_URL?: string;
  readonly VITE_APP_STORE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare const __FIREBASE_WEB_CONFIG__: {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
};

declare const __FIREBASE_APPCHECK_SITE_KEY__: string;

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
