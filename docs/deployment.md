# Deployment

## Netlify

- Build command: `npm run build`
- Publish directory: `build/`
- **All redirect rules live in `public/_redirects`**, which Vite copies to `build/_redirects`.
  They do **not** live in `netlify.toml` — read "netlify.toml is not applied" below before you
  move or add any.
- Rules are applied in file order and the first match wins, so the SPA catch-all `/*` must stay
  last. Anything below it is unreachable.

### netlify.toml is not applied

The production site ignores `netlify.toml` entirely. Redirect rules declared there return `200`
and fall through to the SPA catch-all instead of redirecting.

This is not rule precedence. Serving `build/` locally with an identical `_redirects` present,
`netlify.toml` wins and its rules fire correctly:

```
npx netlify-cli dev --offline --dir build --port 8899
curl -sI http://localhost:8899/app     # honours netlify.toml locally
curl -sI https://delirio.fit/app       # ignores it in production
```

So local verification via `netlify dev` **cannot** confirm that a `netlify.toml` rule works in
production. Verify against the deployed site.

Symptom to recognise: a path that should redirect renders a white page instead, because it served
`index.html` and React Router has no matching route.

This went unnoticed for months — `/terms` and `/privacy` were declared in `netlify.toml` in commit
`2fbd77ac` and never worked in production. It surfaced on 2026-08-04 when `/app` failed the same
way. Deploys themselves are healthy; only this file is ignored.

**Suspected cause, unconfirmed:** a stale **base directory** in the site's Netlify build settings
(Site configuration → Build & deploy → Build settings). Netlify reads `netlify.toml` from the base
directory, so a base directory pointing anywhere other than the repository root silently ignores
the root `netlify.toml`. Confirming this requires the Netlify UI.

Nothing else is currently broken by it — `netlify.toml` only ever held redirects, and
`netlify/functions` is empty. But **Netlify Functions, custom headers, build plugins, and edge
functions would all fail the same silent way** if added there. Fix the root cause before relying
on that file for anything.

### /app — the branded download link

`https://delirio.fit/app` is the acquisition link. Use it anywhere the raw App Store URL would
otherwise be pasted: bio links, ads, QR codes, email.

It is a `200` rewrite to `public/app.html`, not a `302` straight to Apple. The reason is iOS: the
OS intercepts an `apps.apple.com` navigation to open the App Store app and cancels it in the
browser. With a bare `302` the tab never rendered anything, so switching back to the browser
showed a white page. `app.html` paints first, hands off to the App Store, then sends the tab to
the landing page once the user returns.

Consequences worth knowing:

- **The App Store URL lives in `public/app.html`, in two places** — the `<a id="store">` href and
  the `STORE` constant in the inline script. Changing the destination means editing that file and
  redeploying. `src/config/product.ts` no longer contains it; `APP_STORE_URL` is just `/app`.
- **The handoff depends on JavaScript.** A `<noscript>` meta-refresh covers JS-disabled browsers.
- **Campaign params are forwarded.** `/app?src=tiktok` reaches Apple as
  `…id6756231078?src=tiktok`. Apple ignores unrecognised params, so this measures clicks in
  Netlify's logs, not installs. Apple's own `pt`/`ct`/`mt` campaign parameters are what surface in
  App Store Connect.
- Keep `app.html` self-contained. It must paint before it hands off, so it must not wait on a
  stylesheet, a webfont, or the app bundle.

## Environment variables

- `VITE_APP_STORE_URL` — where download CTAs point. Defaults to `/app`. Leave it unset unless you
  need CTAs to bypass the interstitial and hit the App Store directly.
- `VITE_CHAT_ENGINE_URL` — production text-chat engine.
- `VITE_PIPECAT_BACKEND_URL` — production voice engine.

The live voice waveform uses the remote audio track already delivered by
Pipecat and requires no additional environment variable or websocket endpoint.

Vite inlines `VITE_*` variables at build time, so changes require a rebuild and redeploy.

## Release checklist

- Confirm every `Get Delirio` action points at `/app`, and that `/app` reaches the real listing.
- **Verify redirects against the deployed site, not `netlify dev`** — see above. Check `/app`,
  `/terms`, and `/privacy`.
- On a real iPhone, confirm `/app` opens the App Store and that returning to the browser shows the
  landing page rather than a blank tab.
- Verify `/`, `/terms-of-service`, `/privacy-policy`, and `/data-deletion`.
- Run `npm test`, `npm run typecheck`, `npm run lint`, and `npm run build`.
- Test coach selection, text error/retry, microphone permission, voice connect/mute/end/retry, the live coach-audio waveform, FAQ deep links, and pricing.
- Check 390×844, 820×1180, 1440×900, and 320px reflow.
- Confirm the static release does not contain the prototype MP4.

The verified production listing now exists (`id6756231078`) and the official App Store badge is
rendered in the header and footer. A smart banner is still not used.
