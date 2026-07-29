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

The rules allow anonymous-authenticated clients to create validated feedback
documents. Client reads and deletes are denied. A questionnaire document may be
updated only by its originating anonymous Firebase user, and only by adding or
changing its top-level `email` field when that visitor explicitly enters an
email at the end of the quiz. The saved answers are not rewritten.

The conditional product questionnaire uses a version 6 answer envelope while
preserving the version 2 Firestore document shape. It records GLP-1 context and
the situational barriers that make fitness support difficult. Its expanded
answers are serialized into the existing `wish`, `coachingUsefulness`, and
`nextBuild` strings. Each group includes a readable `responses` array containing
the exact question prompt and visible answer label selected by the visitor, in
addition to the stable choice IDs used for analysis. A future normalized schema
requires an explicit Firestore rules review and migration before deployment.

The same questionnaire overlay opens from the default hero's **Shape What's
Next** action and from the lower-page research prompt. After Firestore confirms a
successful write, the overlay links to the wishlist form; it never presents the
research answers as a generated plan.
Every invocation begins a fresh local questionnaire session. Every completed
session calls Firestore `addDoc`, which creates a new random document ID; the
stable browser ID remains a correlation field and is never used to overwrite or
deduplicate responses.

The footer wishlist creates a separate authenticated, create-only document in
`warmNetwork`. It stores exactly six fields: normalized `email`, client-millisecond
`TimeSTamp`, server-generated `createdAt`, the fixed `source`, anonymous Firebase
`ownerUid`, and the first-party `browserID`. Questionnaire answers and schema
metadata are not copied into this collection.

When a visitor opts in from the completed questionnaire, the site updates the
same `webQuestionaire/{submissionId}` document that already contains the quiz
answers. The normalized email is added as that document's top-level `email`
field without rewriting the questionnaire answers. No second identified
questionnaire record is created, so the original random Firestore ID remains
the identifier for the complete response.

## Rules deployment boundary

The checked-in [firestore.rules](../firestore.rules) includes the narrowly
scoped questionnaire update and `warmNetwork` create paths described above.
Deploy the strict six-field `warmNetwork` rule with the matching website client:
the new rule intentionally rejects the legacy questionnaire-envelope payload,
while the new client will be rejected until that rule is live.

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
