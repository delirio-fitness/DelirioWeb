/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_STORE_URL?: string;
  /** Microsoft Clarity project ID (free service, no subscription required). */
  readonly VITE_CLARITY_PROJECT_ID?: string;
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
