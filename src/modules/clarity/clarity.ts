/**
 * Microsoft Clarity integration — barebones, self-contained module.
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  IMPORTANT: CLARITY DOES NOT REQUIRE AN API KEY OR SUBSCRIPTION          ║
 * ║                                                                          ║
 * ║  • Microsoft Clarity is 100% FREE forever (no paid tiers).               ║
 * ║  • It does NOT use a secret API key.                                     ║
 * ║  • It uses a PUBLIC "Project ID" (example: "abc123xyz").                 ║
 * ║  • You get the Project ID for free after creating a project at:          ║
 * ║      https://clarity.microsoft.com                                       ║
 * ║                                                                          ║
 * ║  The only thing you ever need to paste is the Project ID below.          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 *
 * Official tracking script: https://www.clarity.ms/tag/<YOUR_PROJECT_ID>
 *
 * This module:
 * - Loads the official Clarity tracking script once.
 * - Is safe to call multiple times (idempotent).
 * - Only runs in the browser.
 * - Falls back to VITE_CLARITY_PROJECT_ID when no ID is passed.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * WHERE TO PUT YOUR PROJECT ID (THE ONLY PLACE YOU NEED TO EDIT)
 * ─────────────────────────────────────────────────────────────────────────────
 * Option A (recommended for local dev):
 *   1. Copy .env.example → .env.local
 *   2. Set: VITE_CLARITY_PROJECT_ID=your-project-id-here
 *
 * Option B (production / Netlify / hosting):
 *   Add the variable in your hosting provider's environment settings:
 *     VITE_CLARITY_PROJECT_ID=your-project-id-here
 *
 * Do NOT put it in source code. Do NOT commit real IDs to git.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   import { initClarity } from '@/modules/clarity';
 *   initClarity(); // uses env var (this is what main.tsx does)
 *
 *   // or pass explicitly (useful for tests or different projects)
 *   initClarity('your-project-id-here');
 */

const CLARITY_SCRIPT_ORIGIN = 'https://www.clarity.ms';

let initialized = false;
let currentProjectId: string | null = null;

declare global {
  interface Window {
    clarity?: ((...args: unknown[]) => void) & {
      q?: unknown[];
    };
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

import { EFFECTIVE_CLARITY_PROJECT_ID } from './config';

function getProjectId(explicitId?: string): string | null {
  if (explicitId && explicitId.trim()) {
    return explicitId.trim();
  }

  // Priority (highest first):
  // 1. Value passed directly to initClarity('your-id')
  // 2. VITE_CLARITY_PROJECT_ID from .env / .env.local / hosting platform
  // 3. The constant in src/modules/clarity/config.ts  ← the most obvious place
  const fromEnv = (import.meta.env as Record<string, string | undefined>).VITE_CLARITY_PROJECT_ID;
  const candidate = (fromEnv && fromEnv.trim()) || EFFECTIVE_CLARITY_PROJECT_ID;

  return candidate || null;
}

function injectScript(projectId: string): void {
  if (!isBrowser()) return;

  // Avoid injecting the script twice for the same project
  const existing = document.querySelector(`script[src*="${CLARITY_SCRIPT_ORIGIN}/tag/${projectId}"]`);
  if (existing) return;

  // Clarity's recommended snippet (async, non-blocking)
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.async = true;
  script.src = `${CLARITY_SCRIPT_ORIGIN}/tag/${projectId}`;

  // Append to head (or body as fallback)
  const target = document.head || document.getElementsByTagName('head')[0] || document.body;
  target.appendChild(script);
}

/**
 * Initialize Microsoft Clarity for this session.
 *
 * @param projectId - Optional. If omitted, falls back to VITE_CLARITY_PROJECT_ID.
 *                    Passing an empty string or falsy value disables initialization.
 * @returns true when Clarity was initialized (or was already initialized for this ID)
 */
export function initClarity(projectId?: string): boolean {
  if (!isBrowser()) {
    return false;
  }

  const resolvedId = getProjectId(projectId);

  if (!resolvedId) {
    // No ID configured — this is expected during local dev until you set the env var
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.info('[clarity] No project ID provided (VITE_CLARITY_PROJECT_ID). Skipping initialization.');
    }
    return false;
  }

  // Already initialized for this exact project — do nothing
  if (initialized && currentProjectId === resolvedId) {
    return true;
  }

  // If we were previously initialized for a *different* project, we still proceed
  // (rare, but allows hot-switching in development).
  injectScript(resolvedId);

  // Ensure the global clarity queue exists (Clarity script will take it over)
  if (!window.clarity) {
    // Minimal queue shim in case the script hasn't executed yet
    const queue: unknown[] = [];
    const clarityFn = (...args: unknown[]) => {
      queue.push(args);
    };
    clarityFn.q = queue;
    window.clarity = clarityFn;
  }

  initialized = true;
  currentProjectId = resolvedId;

  return true;
}

/**
 * Returns whether Clarity has been successfully initialized for the current session.
 */
export function isClarityInitialized(): boolean {
  return initialized;
}

/**
 * Returns the project ID that is (or was) used for this session.
 */
export function getClarityProjectId(): string | null {
  return currentProjectId;
}

/**
 * Low-level access to the Clarity global (if you ever need to call custom commands).
 *
 * Example:
 *   getClarity()('event', 'my_custom_event');
 *   getClarity()('set', 'user_type', 'download');
 *
 * Safe: returns null when Clarity is not loaded yet.
 */
export function getClarity(): ((...args: unknown[]) => void) | null {
  return typeof window !== 'undefined' ? window.clarity ?? null : null;
}
