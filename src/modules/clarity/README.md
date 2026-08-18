# Microsoft Clarity Module

Barebones Microsoft Clarity integration for DelirioWeb.

## ⚠️ CRITICAL: NO API KEY OR SUBSCRIPTION REQUIRED

**Microsoft Clarity is completely free forever.**

- No subscription
- No paid plan
- No secret API key

It only needs a **free public Project ID** (a short string like `a1b2c3d4e5`).

You get this ID for free when you create a project at: https://clarity.microsoft.com

---

## The Only Place You Need to Paste the ID

There are **two supported locations**. Pick one:

### 1. Easiest for quick start (single obvious file)

Edit this file:

**`src/modules/clarity/config.ts`**

Look for this section near the top:

```ts
// ←─────────────────────────────────────────────────────────────────────────────
// PASTE YOUR CLARITY PROJECT ID ON THE NEXT LINE
// ←─────────────────────────────────────────────────────────────────────────────
export const CLARITY_PROJECT_ID = '';
```

Replace the empty string with your Project ID:

```ts
export const CLARITY_PROJECT_ID = 'a1b2c3d4e5';   // ← your real ID here
```

### 2. Recommended for real projects (environment variable)

Create `.env.local` (or `.env`) in the project root and add:

```bash
VITE_CLARITY_PROJECT_ID=a1b2c3d4e5
```

You can also set this variable in Netlify / Vercel / your hosting dashboard for production.

**Priority order (what wins):**
1. Value passed in code: `initClarity('your-id')`
2. `VITE_CLARITY_PROJECT_ID` environment variable
3. The constant in `src/modules/clarity/config.ts`

---

## Quick Setup (One-Time)

1. Go to https://clarity.microsoft.com and sign in (free).
2. Create a new project for your website.
3. Copy the **Project ID**.
4. Paste it in **one** of the two places above.
5. Restart `npm run dev`.

The module is already wired into `src/main.tsx` — no other code changes needed.

## How It Works

- `initClarity()` is called once early during app bootstrap (before React render).
- It injects the official Clarity tracking script: `https://www.clarity.ms/tag/<PROJECT_ID>`
- The integration is idempotent — calling it multiple times is safe.
- No script runs if no `VITE_CLARITY_PROJECT_ID` is configured (graceful in dev).

## Usage in Code

```ts
import { initClarity, getClarity, isClarityInitialized } from '@/modules/clarity';

// Already called automatically in main.tsx.
// You normally don't need to call it again.

// Optional: send a custom event or tag
const clarity = getClarity();
if (clarity) {
  clarity('event', 'store_click');
  clarity('set', 'user_segment', 'download');
}
```

## Environment Variables

| Variable                    | Required | Description                          |
|-----------------------------|----------|--------------------------------------|
| `VITE_CLARITY_PROJECT_ID`   | No*      | Your Clarity project ID              |

\* Without it the module silently skips initialization. This is intentional for local development and preview deploys where you may not want to track.

## Data Retention (Free Tier)

- Standard session recordings: **30 days**
- Labeled/favorited sessions: up to **9 months**
- Heatmaps & aggregated data: **9 months**

## Privacy Notes

- You are responsible for consent banners in regions that require them (EEA, UK, Switzerland).
- Clarity respects masking settings you configure in the dashboard.
- Review the official terms before going live: https://clarity.microsoft.com/terms

## Disabling / Removing

1. Remove the `VITE_CLARITY_PROJECT_ID` line from your environment.
2. (Optional) Delete the entire `src/modules/clarity/` folder and the import in `main.tsx`.

## Testing Locally

```bash
npm run dev
```

Open the site. In the browser console you should see:

- Nothing (if no env var set) — normal during dev.
- The Clarity script tag in `<head>` once the env var is set.
- In the Clarity dashboard you will start seeing sessions after a few minutes.

## Production

The same `VITE_CLARITY_PROJECT_ID` must be present at build time on Netlify (or wherever you deploy).

Recommended: set it as an environment variable in your hosting dashboard (Netlify → Site settings → Environment variables) so it is not committed to the repo.
