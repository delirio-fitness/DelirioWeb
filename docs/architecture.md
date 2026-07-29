# Architecture

## Entry and routes

`index.html → src/main.tsx → src/App.tsx`

- `/` renders `src/pages/Landing.tsx`.
- `/terms-of-service`, `/privacy-policy`, and `/data-deletion` render inside `LandingLegalShell`.
- The legal shell reuses the production landing header and footer.

## Landing composition

`Landing.tsx` owns the current page composition plus coach, mode, FAQ, confirmation-dialog, and chat-input state. Reusable interactive and supporting components under `src/components/landing/` are:

- `SessionStudio`: coach selection and voice/text trial states.
- `ConfirmDialog`: accessible coach-switch confirmation.
- `LandingHeader` and `LandingFooter`: matching navigation for legal routes.

Shared coach data lives in `src/content/landingContent.ts`. Production pricing and the App Store destination live in `src/config/product.ts`.

## Live integrations

### Voice

`useVoiceSession` wraps Pipecat with Daily transport. It exposes classified failures, retry state, bot processing/speaking, user speaking, transcripts, and connection controls. The UI derives user-facing states only from observable hook values. Remote coach audio also feeds the browser-side frequency listener described in [Pipecat voice waveform](./voice-waveform.md).

### Text

`useTextChat` POSTs `{ userId, personality, context, interface: "web_chat", message }` to `/api/chat` in development or the configured production chat engine. It parses defensive response shapes and preserves a failed message for retry without duplicating the user turn.

## Styling

- `src/index.css`: precompiled Tailwind utilities retained for legal document content.
- `src/styles/design3.css`: the complete current landing, legal shell, dialog, and responsive design.

The landing uses DM Sans, Space Grotesk, Lucide icons, and the retained autoplay hero video with a reduced-motion fallback.

## Tests

Jest uses JSDOM and SWC through `jest.config.cjs`. Shared browser mocks are in `src/test/setup.ts`. Component and journey tests use React Testing Library and `user-event`; real media permissions, audio, and responsive layout still require browser testing.
