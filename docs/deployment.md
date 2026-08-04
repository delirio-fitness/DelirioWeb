# Deployment

## Netlify

- Build command: `npm run build`
- Publish directory: `build/`
- SPA, legacy legal, and `/app` redirects are defined in `netlify.toml`.
- `/app` is the branded download link: `https://delirio.fit/app` 302-redirects to the App Store
  listing. Changing the destination means editing `netlify.toml` and redeploying — it is a
  server-side rule, not a build-time value.

## Environment variables

- `VITE_APP_STORE_URL` — where download CTAs point. Defaults to `/app`, the branded redirect
  defined in `netlify.toml`. Leave it unset unless you need CTAs to bypass the redirect and hit
  the App Store directly.
- `VITE_CHAT_ENGINE_URL` — production text-chat engine.
- `VITE_PIPECAT_BACKEND_URL` — production voice engine.

The live voice waveform uses the remote audio track already delivered by
Pipecat and requires no additional environment variable or websocket endpoint.

Vite inlines `VITE_*` variables at build time, so changes require a rebuild and redeploy.

## Release checklist

- Confirm every `Get Delirio` action points at `/app`, and that `/app` lands on the real listing.
- Verify `/`, `/terms-of-service`, `/privacy-policy`, and `/data-deletion`.
- Verify `/terms`, `/privacy`, and `/app` still return their configured redirects.
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Test coach selection, text error/retry, microphone permission, voice connect/mute/end/retry, the live coach-audio waveform, FAQ deep links, and pricing.
- Check 390×844, 820×1180, 1440×900, and 320px reflow.
- Confirm the static release does not contain the prototype MP4.

Do not add an App Store smart banner or official badge until the production listing and numeric app ID exist.
