# DelirioWeb specialist agents

This directory defines focused agents for frontend product work. Each agent owns a distinct design discipline while collaborating on shared components and user journeys.

## Product constitution

DelirioWeb is the mobile-first marketing and interactive-demo site for Delirio, an AI fitness-coaching iOS app. The product differentiator is an ongoing coach relationship: Reed or Iris can watch form through the phone camera, coach live during workouts, build and adapt programming, and continue the conversation through voice or text between sessions.

The website must make that relationship tangible, trustworthy, and easy to try. It is not a generic fitness-template site and must not become a feature dump.

These product pillars are immutable, although their layout and presentation may evolve:

1. **Coach selection:** Reed and Iris and their distinct coaching personalities.
2. **Voice Sessions:** the working live voice experience, including permission, connecting, active, muted, ended, and error/retry states.
3. **FAQ content:** the existing AI, coaching, product, and price context that answers trust and purchase objections.
4. **App conversion:** prominent, accurate promotion of the production iOS app and its monthly/yearly subscriptions through the configured App Store listing.

The visual direction is **dark-first, spacious, simple, premium, energetic, and human**. Preserve Delirio's blue and pink coach identities while moving away from the predominantly light current implementation. Treat [Hims](https://www.hims.com/) as inspiration for generous space, short content blocks, direct headings, focused calls to action, and clear section rhythm—not as a brand, copy, component, or trade-dress template.

### Current implementation facts

- Entry path: `index.html -> src/main.tsx -> src/App.tsx -> src/pages/Landing.tsx`.
- The landing page contains coach selection, live voice/text interactions, form-feedback imagery, comparison content, categorized FAQ, pricing, and App Store promotion.
- Voice has `idle`, `connecting`, `connected`, and `error` states in `src/hooks/useVoiceSession.ts`.
- The current landing palette in `src/styles/landing-redesign.css` is light (`#0a0a0a` text over light surfaces) with blue `#3a90ff` and pink `#d875ff` accents. A dark redesign must migrate semantic surfaces and text deliberately rather than merely invert colors.
- The audience is expected to be mobile-heavy because Delirio is an iOS app. Validate at 390x844 first, then 820x1180 and 1440x900.
- The default App Store URL points to Apple’s homepage and is a release blocker until the real Delirio listing is configured.

## Agents

- `ui-guru.agent.md`: visual language, themes, palettes, typography, design-system primitives, and style tokens.
- `ux-guru.agent.md`: layout, interaction design, accessibility, responsiveness, and end-to-end usability.
- `knowledge-researcher.agent.md`: deep web research, evidence evaluation, reasoning, and decision-ready synthesis tailored to another agent.

## Shared operating rules

1. Inspect the existing component, styling, routing, and testing conventions before editing.
2. Prefer reusable system-level improvements over one-off page fixes, while keeping changes proportional to the task.
3. Preserve current product behavior unless the task explicitly changes it.
4. Add or update colocated Jest `*.test.tsx` tests for every relevant React component changed.
5. Add integration tests for important user journeys affected by the work. Journey tests may live in an existing integration-test directory or beside the feature when no convention exists.
6. Test user-visible behavior and accessibility semantics instead of implementation details or brittle style snapshots.
7. If Jest and React Testing Library are not configured, establish the smallest compatible TypeScript/JSDOM setup before adding Jest tests. Do not silently substitute another unit-test runner.
8. Run the relevant tests, typecheck, and lint after implementation. Report any command that cannot run and why.
9. When both disciplines are involved, `ui-guru` owns visual-system decisions and `ux-guru` owns interaction, accessibility, responsive behavior, and journey acceptance criteria.
10. Keep claims honest and source-backed. Fitness coaching is not medical diagnosis or therapy; preserve the FAQ's explicit boundaries and do not invent testimonials, outcomes, certifications, or safety claims.
11. Use `knowledge-researcher` when a decision requires substantial external evidence. Before searching, it must read the receiving agent's complete constitution and profile that agent's responsibilities, vocabulary, workflow, deliverables, tests, boundaries, and existing knowledge. It may investigate standards, papers, datasets, blogs, case studies, videos and transcripts, talks, podcasts, local files, user reports, current competitors, and adjacent products. The requesting agent provides the decision and relevant constraints; the researcher returns a cited brief and categorized reference packet packaged specifically for that agent rather than a generic report or unrelated product changes.
