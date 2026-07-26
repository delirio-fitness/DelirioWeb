import { getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from 'firebase/app-check';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const requiredFields = ['apiKey', 'authDomain', 'projectId', 'appId'] as const;

function getFirebaseApp() {
  const missing = requiredFields.filter((field) => !__FIREBASE_WEB_CONFIG__[field]);
  if (missing.length) throw new Error(`Firebase web configuration is missing: ${missing.join(', ')}.`);

  const existingApp = getApps()[0];
  const app = existingApp ?? initializeApp(__FIREBASE_WEB_CONFIG__);
  if (!existingApp && __FIREBASE_APPCHECK_SITE_KEY__) {
    initializeAppCheck(app, {
      provider: new ReCaptchaEnterpriseProvider(__FIREBASE_APPCHECK_SITE_KEY__),
      isTokenAutoRefreshEnabled: true,
    });
  }
  return app;
}

let services: ReturnType<typeof createFirebaseServices> | null = null;

function createFirebaseServices() {
  const app = getFirebaseApp();
  return { auth: getAuth(app), database: getFirestore(app) };
}

export function getFirebaseServices() {
  services ??= createFirebaseServices();
  return services;
}
