# Deployment

## Netlify

- Build command: `npm run build`
- Publish directory: `build/`
- SPA and legacy legal redirects are defined in `netlify.toml`.

## Environment variables

- `VITE_APP_STORE_URL` — production Delirio App Store listing. The code temporarily falls back to `https://apps.apple.com/`; replacing that placeholder is a release blocker.
- `VITE_CHAT_ENGINE_URL` — production text-chat engine.
- `VITE_PIPECAT_BACKEND_URL` — production voice engine.
- `VITE_TRIGGER_API_KEY` — Pipecat trigger key.

Vite inlines `VITE_*` variables at build time, so changes require a rebuild and redeploy.

## Release checklist

- Configure the real Delirio App Store URL and confirm every `Get Delirio` action opens it.
- Verify `/`, `/terms-of-service`, `/privacy-policy`, and `/data-deletion`.
- Verify `/terms` and `/privacy` still return their configured redirects.
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Test coach selection, text error/retry, microphone permission, voice connect/mute/end/retry, FAQ deep links, and pricing.
- Check 390×844, 820×1180, 1440×900, and 320px reflow.
- Confirm the static release does not contain the prototype MP4.

Do not add an App Store smart banner or official badge until the production listing and numeric app ID exist.
