# Styling

## Design 3 system

The production landing is dark-first. `src/styles/design3.css` owns its page tokens, layout, interaction states, legal shell, dialog, responsive behavior, and reduced-motion fallback. `src/index.css` supplies the precompiled utilities still used by the legal document content.

## Saved hero experiments

The landing currently defaults to `HeroV3`. Alternative compositions remain
isolated and can be reviewed locally without changing their source:

- `/?hero=v1` — original conversion-first left stack.
- `/?hero=v2.3` — saved minimal tactical statistics strip.
- `/?hero=v2` — alias for the current V2 experiment (V2.3).
- `/?hero=v3` — current default; live workout scoreboard staged as a broadcast lower-third.

Unknown or missing `hero` values resolve to V3. Keep shared visual tokens under
the `.d3-hero` selectors and variant geometry under `.d3-hero--v*` selectors.

## Rules

- Keep typography limited to the DM Sans and Space Grotesk families already loaded by the current design.
- Keep explanatory copy on solid surfaces with comfortable measure.
- Coach colors express identity, never success/error state.
- State also uses text, icon, shape, or position; color/glow is never the only cue.
- New custom controls must provide at least a 44×44 CSS-pixel hit region.
- Prefer content-led section height; do not force marketing sections to `100vh`.
- Add mobile behavior at 390px first, then tablet and desktop.
- All motion must preserve meaning under `prefers-reduced-motion`.

The precompiled Tailwind file remains available for legal document typography. New landing UI should use the `d3-*` namespace in `design3.css` and avoid introducing a second design system.
