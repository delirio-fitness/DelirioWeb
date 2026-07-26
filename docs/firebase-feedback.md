# Feedback submission setup

The landing-page feedback form posts to the Netlify Function at `/api/feedback`. The function validates the payload and creates a document in the Firestore `warmNetwork` collection.

Configure one of these server-only environment variable options in Netlify:

1. `FIREBASE_SERVICE_ACCOUNT_JSON` containing the complete Firebase service-account JSON, or
2. all three of `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`.

Do not prefix these variables with `VITE_`; Vite variables are exposed to the browser bundle.

The function limits each IP to five submissions per minute, validates the browser UUID and answer sizes, and silently discards honeypot submissions. Each browser gets a first-party random UUID in local storage, while Firestore separately creates a unique document ID for every submission. It uses Firebase Admin credentials, so the Firestore collection does not need public client-write rules.
