# Contributing

## Pre-commit checklist

Before opening a PR:

```
npm run typecheck   # must pass
npm run lint        # warnings ok, errors must be 0
npm run build       # must produce build/
```

`npm run format` is available but is not run automatically; do not reformat unrelated files in
the same PR.

## Coding rules

- No versioned imports. `import x from "package@1.2.3"` is a Figma Make codegen artifact and
  will break the build. Always use clean specifiers (`from "package"`).
- No Figma Make codegen artifacts in `src/`. The previous cleanup waves removed all of these;
  do not reintroduce them by pasting Figma exports.
- Prefer existing semantic controls and design-system classes before adding a UI dependency.
- Match the Prettier config (`.prettierrc`). Don't reformat existing files in unrelated PRs.

## Adding a new route

In `src/App.tsx`:

```tsx
<Route path="/your-path" element={<YourPage />} />
```

If the page is a legal/static page, wrap its content in `LandingLegalShell` so it inherits the
shared header + footer.
