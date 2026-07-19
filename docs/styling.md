# Styling

## Design 3 system

The production landing is dark-first. `src/styles/design3.css` owns its page tokens, layout, interaction states, legal shell, dialog, responsive behavior, and reduced-motion fallback. `src/index.css` supplies the precompiled utilities still used by the legal document content.

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
