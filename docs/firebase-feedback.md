# Feedback submission setup

The questionnaire writes directly from the Firebase Web SDK to the Firestore
`webQuestionaire` collection. Before writing, Firebase Authentication creates or
restores an anonymous user. Firestore creates a unique document ID, and each
document records both that Firebase UID and the browser's first-party UUID.

## Required Firebase console setup

1. Enable the Anonymous provider under Firebase Authentication.
2. Deploy `firestore.rules` (`firebase deploy --only firestore:rules`).
3. Register the web app with App Check using reCAPTCHA Enterprise, set
   `FIREBASE_APPCHECK_SITE_KEY`, monitor metrics, and then enable Firestore
   enforcement.

The rules allow authenticated clients to create validated feedback documents
only. Client reads, updates, and deletes are denied.

## Configuration boundary

Development reads the gitignored `secrets/firebase.js` file at Vite startup.
Production never reads that file and instead requires these Netlify build
variables: `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
`FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID`,
and optionally `FIREBASE_MEASUREMENT_ID` and `FIREBASE_APPCHECK_SITE_KEY`.

These values are Firebase Web configuration, not service-account credentials.
Never expose a service-account private key to the browser.

## Local MSW credential integration

`./scripts/test-master.sh msw` reads `secrets/firebase.js`, extracts only
`apiKey`, `appId`, and `projectId`, constructs the real project-specific
Firestore REST URL, and verifies its request shape through MSW. The secret file
is gitignored and its values are never printed or snapshotted. When the file is
not present (for example in CI), this local credential test is skipped.
The loader also returns no credentials when `NODE_ENV=production`.

Because MSW intercepts the request before it reaches Google, this confirms local
config loading and client request shape—not deployed Authentication, App Check,
or Firestore Rules configuration.
