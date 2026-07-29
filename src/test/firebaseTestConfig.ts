import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export type FirebaseWebTestConfig = {
  apiKey: string;
  appId: string;
  projectId: string;
};

const secretPath = resolve(process.cwd(), 'secrets/firebase.js');

function extractString(source: string, key: keyof FirebaseWebTestConfig) {
  const match = source.match(new RegExp(`${key}\\s*:\\s*["']([^"']+)["']`));
  if (!match?.[1]) throw new Error(`secrets/firebase.js is missing ${key}.`);
  return match[1];
}

/**
 * Reads only the Firebase Web fields needed by local MSW integration tests.
 * Values are never logged, snapshotted, exported to the browser, or committed.
 */
export function loadFirebaseWebTestConfig(): FirebaseWebTestConfig | null {
  if (process.env.NODE_ENV === 'production') return null;
  if (!existsSync(secretPath)) return null;
  const source = readFileSync(secretPath, 'utf8');
  return {
    apiKey: extractString(source, 'apiKey'),
    appId: extractString(source, 'appId'),
    projectId: extractString(source, 'projectId'),
  };
}
