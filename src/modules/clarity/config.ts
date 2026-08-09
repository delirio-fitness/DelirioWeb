/**
 * ╔════════════════════════════════════════════════════════════════════════════╗
 * ║              ★ DELIRIO WEB — CLARITY PROJECT ID (CONFIGURED) ★              ║
 * ║                                                                             ║
 * ║   Microsoft Clarity does NOT require an API key or subscription.            ║
 * ║   It is 100% FREE forever.                                                  ║
 * ║                                                                             ║
 * ║   Project ID is now set below.                                              ║
 * ║   Tracking will be active once this file is loaded in the browser.          ║
 * ║                                                                             ║
 * ╚════════════════════════════════════════════════════════════════════════════╝
 *
 * Live Project ID: xzksvntg8c
 *
 * Priority (what wins at runtime):
 *   1. Value passed to initClarity('id')
 *   2. VITE_CLARITY_PROJECT_ID env var
 *   3. The constant below in this file
 */

// ═══════════════════════════════════════════════════════════════════════════
// ★ DELIRIO WEB — LIVE MICROSOFT CLARITY PROJECT ID ★
// ═══════════════════════════════════════════════════════════════════════════
// Project ID: xzksvntg8c
// Microsoft Clarity is 100% free (no API key, no subscription).
//
// This value is now active. When the site loads, the official Clarity script
// will be injected and session tracking + heatmaps will begin.

export const CLARITY_PROJECT_ID = 'xzksvntg8c';

// ─────────────────────────────────────────────────────────────────────────────
// For production builds (recommended):
// Set the same value as an environment variable on your hosting platform:
//     VITE_CLARITY_PROJECT_ID=xzksvntg8c
// This is cleaner than hard-coding it in source for deployed builds.
// ─────────────────────────────────────────────────────────────────────────────

// Internal resolution (used by clarity.ts)
const rawId = (CLARITY_PROJECT_ID || '').trim();

/** The Project ID that will actually be used for tracking. */
export const EFFECTIVE_CLARITY_PROJECT_ID = rawId || '';

/** Convenience flag: true when tracking will be enabled. */
export const HAS_CLARITY_PROJECT_ID = EFFECTIVE_CLARITY_PROJECT_ID.length > 0;
