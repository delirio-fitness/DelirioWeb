# Delirio Web

Production marketing landing page for Delirio, an AI fitness coaching iOS app. The site describes
the coaching experience, introduces the two AI coaches, hosts legal pages, presents subscription
pricing, and routes acquisition to the App Store.

## Stack

- React 18 + TypeScript (strict)
- Vite 6 (`@vitejs/plugin-react-swc`)
- Tailwind v4 — pre-compiled stylesheet checked in at `src/index.css`; no PostCSS or runtime config
- `react-router-dom` v7 for client-side routing
- Netlify hosting (build dir `build/`)

The site has **no backend of its own** and stores nothing about a visitor. Its one server-side
piece is `netlify/functions/conversion.mts`, which reports ad conversions to Meta. It used to run
live voice and text coaching from the browser (see **No coaching from the website**) and, later, a
Firestore-backed waitlist (see **The waitlist is gone**); neither remains.

## Entry chain

```
index.html → src/main.tsx → src/App.tsx → src/pages/Landing.tsx
```

Legal routes wrap their content in `src/components/LandingLegalShell.tsx`, which renders the current
Design 3 navigation and footer around the page body.

## Routes

- `/` — Landing
- `/terms-of-service` — Terms (legal shell)
- `/privacy-policy` — Privacy policy (legal shell)
- `/terms` and `/privacy` 301-redirect to the new paths.
- `/app` is the branded download link, and **the whole acquisition path** — every CTA on the site
  points here, and so should anything pasted off-site. It is a static interstitial
  (`public/app.html`), not a React route: it paints, hands off to the App Store, then sends the
  tab to `/` when the user returns. The App Store URL itself lives in that file, nowhere else.
  In the React tree, reach it only through `AppStoreLink` — see **Download, not waitlist**.

Redirects are defined in `public/_redirects` (first match wins, SPA catch-all `/*` stays last),
**not** `netlify.toml` — see **Non-obvious things** and `docs/deployment.md`. None of them run
under `npm run dev`; only a Netlify-served build applies them.

## Landing experiment

`/` renders one of two acquisition cells, selected by `?v=`:

- `?v=b` (**or no param — this is what `delirio.fit` serves**) — `HeroFocus`, a centred hero
  built around a single oversized button.
- `?v=a` — `HeroV3`, the standard hero, with one arrow-led `DOWNLOAD THE APP`. Opt-in now.

Hero only; everything below it is identical in both cells. The letters did **not** move when B
became the default — `?v=b` still means what it always meant, and every fallback resolves through
`DEFAULT_LANDING_VARIANT` rather than a literal `'a'`, so they followed the default on their own.
`HeroExperiment` returns `HeroFocus` as its terminal branch for the same reason: a cell that goes
unrecognised should land on the shipped page.

### Nothing has run yet, which is why the letters could be reassigned

No ad has pointed at this site and no `landing_*` figure exists in Events Manager. Both cells
start from zero, so the letters carry no history — worth knowing before reading any of the
experiment scaffolding as though it has produced data.

There were three cells. The original A and B were the *same* `HeroV3` with the button drawn
label-first or arrow-first — a test of arrow placement, far too subtle to spend on. The clearer
treatment survived and took the letter A; the old C became B. The `label-first` rendering,
`HeroV3Cta`, and ~25 `d3-hero-questionnaire-*` CSS rules were deleted with the cell they served,
so `?hero=v3` no longer reaches that button either.

A stale `?v=c` falls through to the default cell rather than resolving to nothing. That matters
only for a pasted link now, but `experiment.test.ts` pins it so the failure stays a known landing.

Choosing B as the default was decided the same way, and for the same reason: nothing had run, so
it was a judgement about which page to serve rather than a result. **Tests that want to prove a
cell was actually read must pin `a`** — asking for `b` and getting it passes just as happily with
the URL and the session store both ignored, which is how the default flip quietly gutted four of
them.

`src/config/experiment.ts` resolves the cell, remembers it in `sessionStorage` for the tab, and
publishes it as `window.delirioLandingVariant` and `data-landing-variant` on `.d3-page` — that is
where ad tracking reads the assignment from. `?hero=v1|v2|v2.3|v3` still pins a saved hero
composition for design review and beats `?v=`.

The cells now differ only in hero layout, since both carry the same single `DOWNLOAD THE APP` and
`store_click` is what either would be read on. A 30-second timer used to auto-open the waitlist
gate in both cells; it went with the gate, and the page now interrupts nobody.

## Download, not waitlist

The app is back on the App Store, so the site's job is a handoff: explain the product, then send
people to `/app`. **Every acquisition surface links to the App Store, and nothing collects
anything from a visitor.**

| Surface | Now |
|---|---|
| Landing header | `DOWNLOAD` → `/app`, **only past the hero** (below) |
| Legal-page header (`LandingHeader`) | `DOWNLOAD` → `/app`, no `sectionPrefix` — it leaves the site |
| Hero, both cells | one `DOWNLOAD THE APP` → `/app` |
| Plan journey, chapter 02 | `DOWNLOAD THE APP` → `/app` |
| Both plan cards (`PlanCard`) | no CTA — cards otherwise unchanged |
| Footer feature slot | `AppStoreBadge` — Apple's artwork → `/app` |

### `AppStoreLink` is the only way to the store, and that is the point

Every link above renders through `src/components/landing/AppStoreLink.tsx`, which sets the href,
`target="_blank"`, `data-cta="store"`, and fires `recordQualifiedAction('store_click')` on click.
`AppStoreBadge` wraps it rather than building its own anchor.

**Do not paste `APP_STORE_URL` into a bare `<a>`.** A store link with no conversion attached hands
the visitor to Apple and reports nothing, which is indistinguishable in Events Manager from a link
nobody clicked — the exact failure that got the previous `useStoreClickTracking` deleted rather
than left half-wired. `Landing.test.tsx` pins it: every `[href="/app"]` on the page must carry
`data-cta`, and no other element may carry `data-cta` at all.

Both hero CTAs and the plan-journey CTA became `<a>` elements where they used to be `<button>`.
Their CSS already carried `inline-flex` and `text-decoration: none`, so only `.d3-plan-live-quiz a`
needed those added — an `<a>` will not centre its label or honour `min-height` without them.

### The waitlist is gone, and it is not coming back behind a flag

While the app was in App Store review, every download CTA pointed at a six-question waitlist gate
that collected an email. **All of it is deleted, not disabled**: `WaitlistModal`, `WaitlistSteps`,
`WaitlistClaim`, `WishlistSignup`, `waitlistQuestions.ts`, `waitlistOrder.ts` (`?wo=`),
`wishlistSubmission.ts`, `feedbackSubmission.ts`, `browserFeedbackId.ts`, the 30-second auto-open
timer, and ~120 `d3-questionnaire-*` / `d3-wishlist-*` CSS rules. All recoverable from git.

Consequences worth knowing:

- **The site writes to Firestore from nowhere.** `wishlist2` still exists and may hold records
  from the period the gate ran — the privacy policy and `/data-deletion` say so rather than
  claiming otherwise, because nothing here has deleted them. `firestore.rules` was left untouched:
  it governs the whole Delirio project (`users`, `workouts`, entitlements, messaging locks), not
  just this site, so pruning the website block is a separate, deliberate deploy.
- **`src/services/firebaseClient.ts` now has no importer.** Kept as the project-level bootstrap
  along with the `vite.config.ts` defines and `secrets/firebase.js` loading. It is dead weight
  today; deleting it means unwiring the build and the MSW credential test too, which is a decision
  rather than a tidy-up.
- `?wo=` and `?wl=` are inert. `?v=` still works and still selects the hero.
- `id="wishlist"` does not exist and `Landing.tsx` no longer special-cases `/#wishlist`. A stale
  link carrying that hash finds no target, so the visitor lands at the top of the page — which is
  where a download CTA is anyway. `Landing.test.tsx` pins that it renders normally rather than
  throwing.
- The word "quiz" is still absent from every user-facing string, and tests still assert it.
  `d3-plan-live-quiz` and `d3-hero-questionnaire-action` keep their class names — pure churn.

### The header CTA is hidden until the hero's is gone

There is no header button at the top of the page. It appears once `pastHeroCta` trips — half a
viewport, roughly where the hero's own button leaves the screen — so the page shows exactly one
download CTA at any scroll position, never two and never none.

It stays **mounted** the whole time and hides with `visibility`, because `.d3-header` is
`justify-content: space-between`: unmounting it slides the nav and the hamburger sideways every
time it appears. For the same reason the hiding cannot be left to the stylesheet alone — it also
carries `aria-hidden` and `tabIndex={-1}`, so a keyboard or screen-reader user cannot reach a
control nobody can see. Changing any one of those three needs the other two changed with it.


## No coaching from the website

The site used to run the real product in the browser: pick Iris or Reed, then hold a live voice
conversation (Pipecat + Daily, real microphone) or a text one (REST to the chat engine). **That
feature did not work reliably, and it is gone — deleted, not hidden behind a flag.** Nothing on
the site now connects to a coaching backend; there is no coach to select and no session to start.

`#coaches` still exists and is still in the nav and footer. It now resolves to
`CoachIntroSection` — an editorial section that introduces Iris and Reed and asks nothing of the
visitor. It contains **zero buttons and zero links**, and a test in `Landing.test.tsx` asserts
that; adding an interactive element there is a decision, not a tidy-up.

Removed outright, all recoverable from git:

| Gone | Was |
|---|---|
| `useVoiceSession`, `usePipecatFrequencyListener` | live voice session + mic frequency meter |
| `useTextChat` | REST chat, via the `/api/chat` dev proxy in `vite.config.ts` |
| `SessionStudio`, `VoiceFrequencyWaveform` | the coach picker, mode tabs, and both stages |
| `ConfirmDialog` | "switching coaches ends your session" guard |
| `utils/pipecatConfig.ts` | backend URLs + `generateDiscoveryId` |
| `@pipecat-ai/client-js`, `@pipecat-ai/daily-transport` | uninstalled from `package.json` |
| `START VOICE SESSION` in `PlanToLiveGuidance` chapter 01 | `.d3-voice-cta` |
| ~180 `coach-trial__*` / `d3-dialog` / `d3-voice-cta` CSS rules | `design3.css`, now `coach-intro__*` |

Two consequences that are easy to miss:

- **The FAQ, pricing, Terms, and Privacy Policy still describe voice and text coaching, correctly**
  — the *app* does both. Only the website demo was retired. Do not "fix" that copy.
- Cards in the coach section take their height from `align-items: stretch`, not `height: 100%`.
  The row is itself a flex item, so a percentage height resolves against an indefinite parent and
  silently collapses each card to its own content — which is how it broke the first time.

## Commands

```
npm run dev         # vite dev server on :3000
npm run build       # vite build → build/
npm run preview     # serve build/
npm run typecheck   # tsc --noEmit (strict)
npm run lint        # eslint src
npm run format      # prettier --write src
npm test            # Jest + React Testing Library
npm run test:watch  # interactive Jest watch mode
npm run test:coverage
```

Jest covers component behavior and integration journeys. Browser testing remains required for
responsive layout, real microphone permission, audio, contrast, and motion.

## Verifying changes

Before reporting any code change as done:

1. `npm run typecheck` — must pass.
2. `npm run lint` — must not introduce new errors. Existing warning count is in **Lint state**
   below; don't increase it without reason.
3. **Browser-test the change.** Start `npm run dev` and use the `playwright-cli` skill
   (defined at `.claude/skills/playwright-cli/`) to drive a real browser against
   `http://localhost:3000`. Visit the affected route, exercise the changed flow end-to-end,
   and check the console (`playwright-cli console`) for new errors or warnings. Typecheck and
   lint confirm code correctness; only the browser confirms feature correctness. If you
   genuinely cannot exercise the flow in a browser (e.g. it depends on a backend you can't
   reach), say so explicitly rather than claiming success.
4. **Test mobile first.** This is a marketing site for an iOS app — the majority of real
   traffic will land on a phone. Any UI change must be checked at a phone viewport before
   it's reported as done; desktop alone is not enough. Sanity-check at least these two
   viewports, and add a tablet width if the change touches a breakpoint:
   ```
   playwright-cli resize 390 844    # iPhone-class — REQUIRED for any UI change
   playwright-cli resize 1440 900   # desktop
   playwright-cli resize 820 1180   # iPad-class — when touching responsive breakpoints
   ```
   Watch for: text overflow, tap targets <44px, horizontal scroll, content hidden behind the
   sticky header, hero/section padding collapsing, and image mockups overlapping copy.

### playwright-cli artifacts

All `playwright-cli` output — screenshots, PDFs, traces, videos, snapshot YAMLs, console
logs — must land inside `.playwright-cli/` (gitignored). Auto-named files (snapshots,
console logs) already go there; for screenshots and PDFs you **must** pass the path
explicitly or they fall into the repo root:

```
playwright-cli screenshot --filename=.playwright-cli/hero.png
playwright-cli screenshot e5 --filename=.playwright-cli/hero-cta.png
playwright-cli pdf --filename=.playwright-cli/page.pdf
```

Never write playwright artifacts to the repo root or anywhere else under version control.

### Session hygiene

- Always run `playwright-cli close` when done — don't leave headless browsers around.
- Stop the dev server when done (kill the background `vite` process you started).
- Don't reuse a stale browser session across unrelated tasks. If `playwright-cli` returns
  "browser is not open," start fresh with `playwright-cli open <url>` rather than guessing.

## Environment variables

```
VITE_APP_STORE_URL         # Where download CTAs point (default: /app, the branded interstitial).
                           # Read by config/product.ts, whose only consumer is AppStoreLink.
VITE_CLARITY_PROJECT_ID    # Optional override for the Clarity project ID committed in
                           # src/modules/clarity/config.ts. Unset in the Netlify build.
```

Ad reporting is configured **server-side only**, and the names are deliberately not `VITE_`-prefixed:

```
META_DATASET_ID            # Meta dataset (pixel) ID. Unset = the function reports nothing.
META_CAPI_ACCESS_TOKEN     # System-user token from Events Manager. A SECRET.
META_TEST_EVENT_CODE       # Optional. Routes events to Test Events. UNSET IN PRODUCTION.
```

All three are read in `netlify/functions/conversion.mts` and never reach the bundle. **Never prefix
any of them with `VITE_`** — Vite inlines every `VITE_*` variable into client JavaScript at build
time, which would publish a token that can write to the live dataset to anyone who opens devtools.

`META_TEST_EVENT_CODE` is the only way to watch an event arrive: Events Manager's Test Events panel
shows nothing for events that do not carry a code, so without it a working integration and a broken
one look identical from the browser. Take the `TEST…` code from that panel, set it, redeploy,
exercise the flow, then **unset it and redeploy again** — Meta excludes test events from attribution
and optimization, so a code left in place reports nothing while the function still answers
`reported: true` on every call. The function logs `[delirio-ads] META_TEST_EVENT_CODE is set` on
every request it handles and adds `test: true` to its response, because the failure is otherwise
invisible until someone notices the dataset sitting at zero.

Product pricing and acquisition configuration live in `src/config/product.ts`.

`VITE_CHAT_ENGINE_URL` and `VITE_PIPECAT_BACKEND_URL` were removed with the coaching demo, and
`VITE_META_PIXEL_ID` went with the browser pixel. Nothing reads them; setting them does nothing.

## Ad conversion tracking

**There is no Meta pixel on this site, and one must not be added back.** `fbevents.js` is
closed-source, runs with full DOM access, reports the URL and title of every page it loads on,
collects the text of what visitors click, and — with one checkbox in Events Manager, *Automatic
Advanced Matching* — scrapes form fields and sends them hashed. None of that is controllable from
this repo, and Meta can change it server-side without us deploying anything. The waitlist that
originally made this urgent is gone; the reasoning is not conditional on it.

Conversions are reported from `netlify/functions/conversion.mts` over the Conversions API instead.
The browser posts a trigger slug to `/.netlify/functions/conversion`; the function looks up
everything else and builds the payload. Meta learns a conversion happened on a given ad click and
nothing else about the site or the visitor.

### Microsoft Clarity runs here

`src/modules/clarity` loads Clarity from `main.tsx` for every visitor — session replay and
heatmaps. It is **not** an advertising script and sends nothing to Meta, but it is third-party code
with full DOM access, so two things stay true:

- **The site has no form, no text box, and no radio group, so there is nothing here for replay to
  capture that a visitor typed or chose.** That is what retired the `data-clarity-mask="True"` on
  the old `WaitlistModal` backdrop — the mask existed because Clarity's default masking covers
  input *contents* only, while an option's `name`, `value`, and sibling `<span>` are ordinary DOM
  that replay reconstructs perfectly. **Anything added here that asks the visitor a question needs
  that mask back, on the subtree root, plus a test pinning it** — nothing else would notice its
  absence, because Clarity would simply start recording.
- **The privacy policy has an "Analytics on this website" paragraph** naming Microsoft and saying
  the recording exists. It now says there is nothing typeable to record; adding an input makes that
  false in a checkable way.

Note the project ID is committed in `config.ts` rather than read from `VITE_CLARITY_PROJECT_ID`, so
turning Clarity off needs a deploy.

| Trigger | Standard event | `value` | `Delirio*` twin | Fired from |
|---|---|---|---|---|
| `page_view` | `PageView` | — | **no** | `Landing.tsx`, on mount. `/` only |
| `store_click` | `Lead` | 4 | yes | `AppStoreLink.tsx`, from every download CTA on the site |

A normal visit sends both, in that order.

**`store_click` is where this site's funnel ends.** The install, the trial, and the subscription
are reported by the Meta SDK inside the iOS app, against the same dataset — do not try to
reconstruct any of them from the website. `Lead` rather than an install-shaped event because that
is what this honestly is: an intent signal from a web page, not a confirmed install. Point install
campaigns at the app's own events.

**`page_view` is the exception to two things that hold for the others**, and both exceptions are
deliberate rather than oversights — see the trigger table in `netlify/functions/conversion.mts`:

- **No `Delirio*` twin.** The custom names exist to make Events Manager readable where a standard
  name is ambiguous; `PageView` is not, and this is by far the highest-volume trigger, so a twin
  would double the noisiest row in the dataset to restate its own name.
- **No `value`.** `value` is an intent score and a page load carries none. The function omits
  `currency` with it, so a trigger with a null `value` sends neither.

It is also the only trigger that is **input rather than a target**: every visitor does it, so
pointing an ad set at it buys traffic and nothing else. It exists because Meta otherwise hears only
from the few percent who click through to the store and has no picture of the rest. It is
additionally the one signal that survives Meta's health-and-wellness restrictions, which cut mid-
and lower-funnel events and leave upper-funnel ones alone.

**`page_view` must never be routed through `recordQualifiedAction`.** That function's
`delirio:qualified-actions` storage decides `firstOfVisit` by its *length*, and the server sends the
standard `Lead` only when that is true. A page view precedes every CTA by definition, so sharing the
key would flag `store_click` as `false` and `Lead` would silently stop reporting — the twin climbing
in Events Manager while the optimizable event sits at zero. Hence the separate `delirio:page-view`
key and the hard-coded `firstOfVisit: false`, both pinned by tests.

### The rule that still shapes the table

**No conversion may fire at or after a question about the visitor.** An event that only fires for
people who answered such a question discloses health through its *timing* — the payload does not
have to carry the answer, and renaming the event changes nothing, because the correlation is the
disclosure. This is the GoodRx/BetterHelp fact pattern, and Washington's My Health My Data Act
carries a private right of action.

Nothing on the site asks a question today, so nothing currently tests this. **It is written down
because it is not a fact about the questions that are gone.** It was written when the waitlist's
third question asked about GLP-1 titration stage, survived that question being softened, and
survives the whole gate being deleted — it governs *where* an event may fire, not how sensitive
this month's wording happens to be. Anything that asks the visitor about themselves again inherits
it from the moment it is added, and `conversionEvents.test.ts` pins `quiz_completed` and
`questionnaire_email_submitted` as names the trigger union must keep refusing.

Consequences that look like bugs but are not:

- The trigger union has exactly one member. That is the shape to keep: a second trigger needs a
  reason beyond "we could measure it", and this rule is the first thing it has to clear.
- `voice_demo_started` and `text_demo_engaged` went with the coaching demo; `waitlist_started` and
  `email_submitted` went with the gate. All four are pinned as refused.

### Reading the numbers

- **`Lead` counts qualified visitors, not actions.** The browser flags the visit's first qualifying
  action as `firstOfVisit`, and only that one gets `Lead`. With one trigger in the union that flag
  is always true, so the guard is currently a no-op — it is kept because it is what makes adding a
  second trigger safe rather than something that quietly doubles the `Lead` count.
- `store_click` also sends `DelirioStoreClick` — good for reporting, weak to optimize on, since
  Meta has cross-advertiser priors for `Lead` and none for a name we invented. **Sending both does
  not make the learning phase end sooner.** An ad set counts only the one event it optimizes on —
  roughly 50 a week to leave learning — so the second name buys reporting, never velocity.
- **`store_click` is the only place a download intent is attributable to a creative.** The App
  Store console knows installs happened but not which ad produced them; the Meta SDK in the app
  covers the install itself. This event is what connects a creative to someone choosing to go.
- **Each trigger fires at most once per visit**, tracked in `sessionStorage` — under two separate
  keys, and they must stay separate. See the `page_view` note above for what merging them breaks.
  Once-per-visit is also why a visitor who clicks the hero button and then the footer badge is one
  `Lead`, not two.
- `value` is an intent score, not revenue. Do not compute ROAS from it. The table lives **on the
  server** so the public endpoint cannot be told what a conversion is worth.
- Where a trigger sends both a standard and a `Delirio*` event, the two share one `event_id` as the
  dedup key. `page_view` sends one event, so its ID is its own.
- Cheap actions (scroll depth, section views) are deliberately not tracked. `page_view` is not a
  counterexample — it is not reported as an *action*, and it is never something an ad set optimizes
  toward.

### What is in the payload

`user_data` carries IP, user-agent, and `fbc` — the ad click ID, rebuilt server-side as
`fb.1.<clickTime>.<fbclid>` from the `fbclid` and `capturedAt` that `attribution.ts` stored on the
landing URL. **No email, no name, no phone, no external ID, no page path, no title, no referrer.**
`event_source_url` is the bare origin, identical for every visitor.

#### The hashed email is gone, and re-adding one is a decision

`email_submitted` once carried `em`: SHA-256 of the waitlist address, lowercase hex. The site
collects no address now, so the field, its `acceptsEmail` gate in the server trigger table, the
`recordQualifiedAction` email overloads, the `ConversionBeacon.email` field, and the SHA-256 helper
were all deleted rather than left inert. Recoverable from git.

What went with it, and what a future re-add would have to re-solve:

- **Normalisation is trim and lowercase, nothing else.** Stripping Gmail dots or `+suffixes`
  produces a hash that matches nothing while looking correct from here, and the failure is silent —
  the event posts, the function answers `reported: true`, and only the match rate moves.
- **The endpoint is public and guarded only by an `Origin` check**, which a `curl` forges in one
  line. Any caller could post an arbitrary address and have that person's matchable hash sent to
  Meta under a signup they never made. This was raised in review (PR #6, 2026-08-09) and accepted
  as a known risk on the grounds that the site was pre-launch; that acceptance expires with the
  premise. Closing it means the function verifying the address against a real record, which needs
  admin credentials in the Netlify environment.
- **The privacy policy is part of the feature, not paperwork around it.** The hashed email had to
  be named in the reported-actions list, in the collection section, and in "Do Not Sell or Share" —
  and now the policy says plainly that no address is sent in any form. A published policy that is
  false in a checkable way is the FTC Section 5 hook the GoodRx and BetterHelp orders turned on.
  **Changing what goes in `user_data` means changing that copy in the same PR.**


Attribution (`src/utils/attribution.ts`) is captured in `main.tsx` before render and held for the
tab: react-router drops the query string on internal navigation, and the campaign is unrecoverable
after that. First touch wins — a later visit with different parameters never overwrites it.

`npm run dev` logs every event to the console as `[delirio-ads]` and posts nothing, since no
function runs under Vite.

## Non-obvious things

- Tailwind v4 zero-config: `src/index.css` is the **pre-compiled** Tailwind output (the file
  starts with `/*! tailwindcss v4.1.3 ... */`). Tailwind itself is not in `package.json`. To
  regenerate, install `tailwindcss` and rebuild upstream of this repo, or hand-edit `index.css`.
- Tokens (colors, spacing, typography) live in the `@layer theme` block at the top of
  `src/index.css`. Custom utilities are in `@layer utilities`.
- **`netlify.toml` is ignored in production.** Rules declared there silently return `200` and fall
  through to the SPA catch-all, rendering a white page on any path that should redirect. `/terms`
  and `/privacy` were broken this way for months. Put redirects in `public/_redirects`. `netlify
  dev` honours `netlify.toml` locally, so it will *not* reproduce this — verify redirects against
  the deployed site. Full write-up and suspected cause in `docs/deployment.md`.
- The App Store listing URL is not in the TypeScript source. `APP_STORE_URL` is `/app`; the real
  Apple URL lives in `public/app.html` (twice — the `<a id="store">` href and the `STORE`
  constant). Its only importer is `AppStoreLink`, which is deliberate — see **Download, not
  waitlist**.
- **`/app` carries per-source campaign attribution for off-site links (Instagram bios and
  similar) via Apple's own App Store Connect Campaigns, not any tracking in this repo.** Two
  forms both work: a full App Store Connect link forwarded verbatim
  (`/app?pt=...&ct=...&mt=8`), or the short form actually handed out,
  `/app/<campaign token>` (e.g. `/app/iris`), expanded client-side in `app.html` using a
  hardcoded `PROVIDER_TOKEN` — Apple's provider token is fixed forever per developer account
  and isn't a secret, so only the campaign token varies per link. `public/_redirects` routes
  both `/app` and `/app/*` to `app.html`; **the path-token match requires the slash**
  (`/^\/app\/(.+)$/`) specifically so a direct hit on `/app.html` itself — which Netlify
  serves as a literal static file, matching neither redirect rule — can't be misparsed into a
  bogus campaign token. Results live in App Store Connect → Analytics → Campaigns, not
  anywhere in this codebase; a new campaign needs 5 first-time downloads and up to 24h before
  it shows data. The `<noscript>` fallback covers neither form (static meta-refresh to the
  bare Apple URL), so a visitor with JavaScript fully disabled loses attribution — accepted,
  since that's essentially never true for the browsers these links are shared in.
- **Firestore rules are a separate deploy from the site**, and a mismatch is silent: the page
  renders perfectly while every write returns `permission-denied`. Netlify never publishes
  `firestore.rules`; that is `npx firebase-tools deploy --only firestore:rules --project
  delirio-480110`, and the file governs the whole Delirio project (`users`, `workouts`,
  entitlements, messaging locks), not just this site. **Diff against the live rules in the console
  before every deploy** and reconcile rather than overwrite — it has drifted badly once already,
  missing `lockedMessagingFields()`. Nothing on the website writes to Firestore any more, so this
  matters for the app's sake now, not the site's.
- **App Check is wired but inert, and unreachable.** `firebaseClient.ts` calls `initializeAppCheck`
  only when `FIREBASE_APPCHECK_SITE_KEY` is set, and it is not set in the Netlify build. It also
  has no importer at all now that the waitlist writers are gone. If App Check is ever wanted, set
  the site key and redeploy **before** enabling enforcement in the console — enabling it first
  denies every write instantly.
- The current landing and legal shell use the `d3-*` namespace in `src/styles/design3.css`.
- **Brand and coach art comes from the shared asset catalog, not from this repo.** Every such
  file is recorded in `.delirio-assets.lock`, and `delirio-assets check` reports when the
  catalog has moved past what is committed here — see the `delirio-assets` skill. Do not
  hand-edit those files or paste a replacement in; re-fetch (or re-derive and `pin`) instead.
  Currently pinned: `public/faviocn.svg` (`logo-brand_primary_black_v2`, the file name is an
  old typo the favicon links still point at), `public/logo.png` (the apple-touch-icon, the
  1024px app icon at `sips -z 180 180`), and the two coach heads under `src/images/emojis/`
  at 960px. The monogram in `public/app.html` is a *hand-copy* of the same mark, inlined so
  the interstitial paints without a second request — nothing tracks it, so it has to be
  updated by hand whenever `faviocn.svg` is.
  App screenshots, hero and planJourney imagery, and the Apple badges are not catalog assets.
- Shared UI should be added only when it has a live consumer; do not retain speculative component libraries.

## Lint and test state

`npm run lint` reports **5 warnings, 0 errors**: three unused price imports in `TermsServices.tsx`,
one `set-state-in-effect` in `AnimatedNumber.tsx`, and one unused eslint-disable directive in
`modules/clarity/clarity.ts`. Don't add to that count without reason.

`npm test` has **one pre-existing failure**, `TermsServices.test.tsx` — it asserts copy
(`$30 per month, billed monthly.`) that is not in the component. The test and the component
disagree about production pricing copy; which one is right is a product question, not a
mechanical fix, so it is left failing rather than papered over. Everything else passes.

`npm run test:layout` is **stale and failing for reasons that predate the waitlist removal** — it
asserts on `.d3-section-intro` and `.coach-trial__intro`, both deleted with the coaching demo. Its
waitlist assertions were replaced with App Store badge ones so it no longer references deleted
markup, but it needs a pass over its remaining selectors before it is worth running again.
