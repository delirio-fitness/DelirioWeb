
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

const firebaseKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
  'measurementId',
] as const;

function localFirebaseConfig() {
  const secretPath = resolve(__dirname, 'secrets/firebase.js');
  if (!existsSync(secretPath)) return null;
  const source = readFileSync(secretPath, 'utf8');
  return Object.fromEntries(firebaseKeys.map((key) => {
    const value = source.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`))?.[1];
    if (!value && key !== 'measurementId') throw new Error(`secrets/firebase.js is missing ${key}.`);
    return [key, value];
  }));
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const productionConfig = {
    apiKey: env.FIREBASE_API_KEY,
    authDomain: env.FIREBASE_AUTH_DOMAIN,
    projectId: env.FIREBASE_PROJECT_ID,
    storageBucket: env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
    appId: env.FIREBASE_APP_ID,
    measurementId: env.FIREBASE_MEASUREMENT_ID,
  };
  const firebaseConfig = mode === 'production' ? productionConfig : localFirebaseConfig() ?? productionConfig;

  return {
    plugins: [react()],
    define: {
      __FIREBASE_WEB_CONFIG__: JSON.stringify(firebaseConfig),
      __FIREBASE_APPCHECK_SITE_KEY__: JSON.stringify(env.FIREBASE_APPCHECK_SITE_KEY ?? ''),
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      open: true,
      proxy: {
        '/api/chat': {
          target: 'https://text-messaging-production.up.railway.app',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/chat/, '/chat'),
        },
      },
    },
  };
});
