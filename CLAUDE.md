# Delirio Web

Production marketing landing page for Delirio, an AI fitness coaching iOS app. The site describes
the coaching experience, introduces the two AI coaches, hosts legal pages, presents subscription
pricing, and routes acquisition to the waitlist.

## Stack

- React 18 + TypeScript (strict)
- Vite 6 (`@vitejs/plugin-react-swc`)
- Tailwind v4 — pre-compiled stylesheet checked in at `src/index.css`; no PostCSS or runtime config
- `react-router-dom` v7 for client-side routing
- Netlify hosting (build dir `build/`)

The site has **no backend of its own** beyond Firestore (quiz answers and waitlist emails). It
used to run live voice and text coaching from the browser — see **No coaching from the website**.

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
- `/app` is the branded download link — use `https://delirio.fit/app` anywhere the App Store URL
  would otherwise be pasted. It is a static interstitial (`public/app.html`), not a React route:
  it paints, hands off to the App Store, then sends the tab to `/` when the user returns. The
  App Store URL itself lives in that file. **The site itself no longer links to it** — see
  **Waitlist, not download**. It is still live for links pasted elsewhere, so a visitor who
  kept the URL can still install; it is off the acquisition path, not disabled.

Redirects are defined in `public/_redirects` (first match wins, SPA catch-all `/*` stays last),
**not** `netlify.toml` — see **Non-obvious things** and `docs/deployment.md`. None of them run
under `npm run dev`; only a Netlify-served build applies them.

## Landing experiment

`/` renders one of two acquisition cells, selected by `?v=`:

- `?v=a` (or no param) — `HeroV3`, the standard hero, with one arrow-led `JOIN THE WAITLIST`.
- `?v=b` — `HeroFocus`, a centred hero built around a single oversized button. Hero only;
  everything below it is identical in both cells.

### The letters were reassigned, and old numbers do not carry over

There were three cells. The original A and B were the *same* `HeroV3` with the button drawn
label-first or arrow-first — a test of arrow placement, far too subtle to spend on. The clearer
treatment survived and took the letter A; the old C became B. The `label-first` rendering,
`HeroV3Cta`, and ~25 `d3-hero-questionnaire-*` CSS rules were deleted with the cell they served.

Three consequences worth holding on to:

- **`landing_a` in Events Manager means one thing before the change and another after**, and the
  old `landing_c` figures are today's cell B. The cells were renamed, not re-randomised, so the
  populations are intact — but the labels lie across the boundary.
- **A live ad still pointing at `?v=c` now falls through to cell A**, not the centred hero it was
  written for. Repoint those URLs. A test in `experiment.test.ts` pins that fallback so it stays a
  known landing rather than a blank.
- `?hero=v3` no longer reaches the label-first button, because nothing renders it.

`src/config/experiment.ts` resolves the cell, remembers it in `sessionStorage` for the tab, and
publishes it as `window.delirioLandingVariant` and `data-landing-variant` on `.d3-page` — that is
where ad tracking reads the assignment from. `?hero=v1|v2|v2.3|v3` still pins a saved hero
composition for design review and beats `?v=`.

Note that the gate auto-opens 30s after load in cell A (`Landing.tsx`), which competes with the
waitlist CTA. Cell B is exempt — it is a single-CTA test, so nothing may cover its button.

## The waitlist gate

The email box is not on the page. It lives at the end of a six-question modal, and there is no
way to reach it without answering all six — the questions exist to filter curiosity from intent
before an address is worth collecting, and to segment what comes back.

A seventh question — *What would make this feel like a win 90 days from now?* — is free text and
sits **beside** the email box rather than in front of it. It does not gate anything and it is
labelled optional. A mandatory free-text field in front of a signup is where signups go to die,
and this is the most expensive answer in the set to give.

**One question per screen, always.** `WaitlistSteps` auto-advances on selection and `WaitlistModal`
owns the shell and the answer state. A second design once rendered all six on a single scrolling
card behind a locked email box, chosen with `?wl=`; it was scrapped, and `WaitlistSinglePage`,
`config/waitlistDesign.ts`, the `design` prop, the `design` field on new records, and ~30
`d3-questionnaire-single*` CSS rules went with it. `?wl=` is now inert. Records written before the
scrap still carry `design: 'steps' | 'single'`, so that field's presence is what dates a document.

### Which comes first: the questions or the email

`?wo=` (`src/config/waitlistOrder.ts`, remembered per tab like `?v=`) picks the sequence:

- `?wo=questions` (default, the control) — intro, six questions, then the email box. The questions
  gate the address, so answering is the price of joining.
- `?wo=email` — the email box first, then the same six questions with a `Skip for now →` on every
  screen. The record is created *from the email*, and each answer is patched on as it arrives, so
  someone who answers two and skips still leaves those two behind.

Two rules for running it, both in that file's header comment: **measure it in Firestore**, counting
records that carry an `email` grouped by `order` (`waitlist_started` is a clean denominator — it
fires on the CTA click in both arms), and **do not report `email_submitted` while it runs**, or
Meta optimizes the arms differently and the test stops being about the order.

Every `?wo=email` record has an email, so none of them hit the "we cannot find your entry to
delete it" case the privacy policy has to describe for the control.

The questions themselves are `src/content/waitlistQuestions.ts` and nothing else. Neither the
component nor the tests need touching to add, remove, or reword one — the counts in the copy ("6 QUESTIONS,
THEN YOUR SPOT", "2 questions left to unlock") are derived, as are the tests. A question may
carry a `note` for small print; `weightProgress` uses it, because that answer is sensitive and ends
up attached to an email address.

**No question or option here may read as a statement about the visitor's body or mind.** Apply that
test to anything new: if the answer could be read as describing someone's physical or mental state,
rewrite it to be about the plan, the schedule, or the goal. Two questions have already been through
this:

- `weightProgress` replaced one asking where the visitor was with GLP-1s, down to titration stage.
  Prescription medication status is named outright as consumer health data by Washington's My
  Health My Data Act and Nevada SB 370, neither of which has a revenue threshold.
- `activityBarrier`'s first option was "Some days my body just can't" (`body_capacity`); it now
  reads "Most plans ask more than I can give". Same product signal, no self-report about a body.

The header comment in that file carries the full reasoning, including why building the consent-and-
policy apparatus was the more expensive alternative. Older Firestore records still carry the
retired `glp1Stage` and `body_capacity` values — `responses` entries are self-describing, so a
reader can tell the vintages apart without a schema version.

Writes in the **questions-first control**, in this order, and the order is the point:

1. Answers land in `webQuestionaire` (`schemaVersion: 3`, flat `responses` array of
   `{id, kind, question, answer, value?}`, plus the `order` that produced them) the moment the last
   *choice* question is answered — *before* the email is asked for. Someone who fills in the
   questions and then declines to leave an address still counts as a read on demand, which is the
   whole reason the questions are there.
2. The free text is patched on **blur**, not per keystroke. Clicking `JOIN` blurs the textarea
   first, so that write is already in flight when the email submits, and `resolveSubmissionId`
   awaits whichever write is latest — the two cannot land out of order. Typing and then
   abandoning still keeps the text, which is the case worth protecting.
3. The email is patched onto that same document, so one visitor is one record.

The email step awaits the answer write (`onResolveSubmissionId`) rather than reading a piece of
state, so a fast typist cannot submit before the document exists and fork a second record. If
the answer write fails outright the email still goes in — as a standalone `warmNetwork` lead —
and the failure is logged as `[delirio-waitlist]`. **Do not make that catch silent**: a
demand-measurement feature that stops recording without saying so is the worst case here.

`?wo=email` inverts step 1 and 3: `submitWaitlistEmailToFirestore` creates the record from the
address, then `updateWaitlistAnswersInFirestore` patches each answer onto it as it is given. That
writer is the email-first arm's workhorse; the control reaches it only for the free text.

### The header CTA is hidden until the hero's is gone

There is no header button at the top of the page. It appears once `pastHeroCta` trips — half a
viewport, roughly where the hero's own button leaves the screen — so the page shows exactly one
`JOIN THE WAITLIST` at any scroll position, never two and never none.

It stays **mounted** the whole time and hides with `visibility`, because `.d3-header` is
`justify-content: space-between`: unmounting it slides the nav and the hamburger sideways every
time it appears. For the same reason the hiding cannot be left to the stylesheet alone — it also
carries `aria-hidden` and `tabIndex={-1}`, so a keyboard or screen-reader user cannot reach a
button nobody can see. Changing any one of those three needs the other two changed with it.

### Nothing links to a waitlist section, because there isn't one

`id="wishlist"` no longer exists in the DOM. Every off-page `JOIN THE WAITLIST` link still
points at `/#wishlist`, and `Landing.tsx` treats that hash as *open the gate*, then clears it —
read at mount rather than in an effect, so the modal is up on the first paint and a reload does
not reopen it. On the landing page itself the CTAs are buttons that call `openQuestionnaire`
directly; `LandingFooter` renders a button when given `onJoinWaitlist` and falls back to the
hash link on the legal pages, which have no gate mounted.

## Waitlist, not download

The app is live, but ads cannot point at it until an update clears review, and the team wants a
read on demand before committing to infrastructure. So every download CTA was replaced by the
waitlist, and **nothing on the site links to the App Store**:

| Surface | Now |
|---|---|
| Landing header | `JOIN THE WAITLIST` button → opens the gate, **only past the hero** (below) |
| Legal-page header (`LandingHeader`) | `JOIN THE WAITLIST` → `/#wishlist` → opens the gate |
| Hero, every cell | one `JOIN THE WAITLIST` button → opens the gate |
| Both plan cards (`PlanCard`) | no CTA — cards otherwise unchanged |
| Footer feature slot | `JOIN THE WAITLIST` → gate on `/`, `/#wishlist` on legal pages |

The word "quiz" is gone from every user-facing string, and `onTakeQuiz` was renamed
`onJoinWaitlist` to match. `d3-hero-questionnaire-action` and the `webQuestionaire` collection
keep their names — both would be pure churn to rename, and the collection name is load-bearing.

`WishlistSignup` is now only ever the email form at the end of the gate
(`placement="questionnaire"`, which renders the form alone — the gate supplies the heading). Its
`landing` placement and the ungated `.d3-wishlist` base styles are kept but have no consumer; an
ungated form anywhere would let a visitor skip the filter the gate exists for, so re-adding one
is a decision, not a tidy-up.

`AppStoreBadge` and `useStoreClickTracking` were deleted, not disabled. `/app` and
`APP_STORE_URL` still exist for links pasted outside this site (bio, email); nothing in the
React tree points at them. **If downloads come back, restore both from git rather than adding a
bare link** — a store link with no `data-cta` converts silently.

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
                           # Nothing in the React tree reads this today — see Waitlist, not download.
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

**There is no Meta pixel on this site, and one must not be added back.** The waitlist asks how a
visitor's weight loss is going and what they want from a training plan
(`src/content/waitlistQuestions.ts`). `fbevents.js` is closed-source, runs with full DOM access,
reports the URL and title of every page it loads on, collects the text of what visitors click, and
— with one checkbox in Events Manager, *Automatic Advanced Matching* — scrapes the email field and
sends it hashed. None of that is controllable from this repo, and Meta can change it server-side
without us deploying anything.

Conversions are reported from `netlify/functions/conversion.mts` over the Conversions API instead.
The browser posts a trigger slug to `/.netlify/functions/conversion`; the function looks up
everything else and builds the payload. Meta learns a conversion happened on a given ad click and
nothing else about the site or the visitor.

| Trigger | `value` | Fired from |
|---|---|---|
| `email_submitted` | 4 | `WishlistSignup.tsx`, **landing placement only** |
| `waitlist_started` | 3 | `Landing.tsx`, from a CTA or an arriving `/#wishlist` |

### The rule that shapes the table

**No conversion may fire at or after the first waitlist question.** An event that only fires for
people who answered those questions discloses health through its *timing* — the payload does not
have to carry the answer, and renaming the event changes nothing, because the correlation is the
disclosure. This is the GoodRx/BetterHelp fact pattern, and Washington's My Health My Data Act
carries a private right of action.

The rule predates the current question set: it was written when question three asked about GLP-1
medication. Softening the questions did not retire it, and softening them further would not either
— it governs *where* an event fires, not how sensitive this month's wording happens to be.

Consequences that look like bugs but are not:

- `WaitlistModal.tsx` reports **nothing**. It used to fire `quiz_completed` when the answers saved.
- `WishlistSignup` reports only at `placement="landing"`. The copy inside the gate is unlocked by
  six answers, so its submit is downstream of the questions.
- The 30-second auto-open does not report. `Landing.tsx` splits `openQuestionnaire` (CTA, reports)
  from `showQuestionnaire` (timer, silent) for exactly this — being shown a modal is not an action.
- `voice_demo_started` and `text_demo_engaged` went with the coaching demo; `store_click` went when
  the last App Store link did.

### Reading the numbers

- **`Lead` counts qualified visitors, not actions.** The browser flags the visit's first qualifying
  action as `firstOfVisit`, and only that one gets `Lead`. Every trigger also sends its own
  `Delirio*` custom event — good for reporting, weak to optimize on, since Meta has cross-advertiser
  priors for `Lead` and none for a name we invented.
- **Each trigger fires at most once per visit**, tracked in `sessionStorage`.
- `value` is an intent score, not revenue. Do not compute ROAS from it. The table lives **on the
  server** so the public endpoint cannot be told what a conversion is worth.
- Both events share one `event_id` as the dedup key.
- Cheap actions (scroll depth, section views, the auto-open) are deliberately not tracked.

### What is in the payload

`user_data` carries IP, user-agent, and `fbc` — the ad click ID, rebuilt server-side as
`fb.1.<clickTime>.<fbclid>` from the `fbclid` and `capturedAt` that `attribution.ts` stored on the
landing URL. **No email, hashed or otherwise**, no name, no phone, no external ID, no page path, no
title, no referrer. `event_source_url` is the bare origin, identical for every visitor.

Sending hashed email would improve match quality and is the obvious thing to reach for. Do not:
the privacy policy's "Advertising, Attribution, and Tracking" section promises in as many words
that it never happens, and the whole design rests on that being true.

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
  constant). `APP_STORE_URL` currently has no importers — it is kept for the interstitial and
  for whenever downloads come back, not because anything renders it.
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

`npm run lint` reports **4 warnings, 0 errors**: three unused price imports in `TermsServices.tsx`
and one `set-state-in-effect` in `AnimatedNumber.tsx`. Don't add to that count without reason.

`npm test` has **one pre-existing failure**, `TermsServices.test.tsx` — it asserts copy
(`$30 per month, billed monthly.`) that is not in the component. The test and the component
disagree about production pricing copy; which one is right is a product question, not a
mechanical fix, so it is left failing rather than papered over. Everything else passes.
