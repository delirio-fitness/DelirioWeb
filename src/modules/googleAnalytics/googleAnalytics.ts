/**
 * Direct Google Analytics 4 integration for delirio.fit.
 *
 * This is intentionally independent of the Meta conversion beacon. It sends
 * no account, health, payment, or other user-entered data. Google Ads uses the
 * tag's normal click attribution; the custom event only records that the site
 * handed a visitor to the App Store.
 */
import type { Attribution } from '../../utils/attribution';
import { ga4MeasurementId } from './config';

const GOOGLE_TAG_ORIGIN = 'https://www.googletagmanager.com';
const APP_STORE_HANDOFF_STORAGE_KEY = 'delirio:ga4-app-store-handoff';

let configuredMeasurementId: string | null = null;

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: Gtag;
  }
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function ensureGtag(): Gtag {
  const dataLayer = window.dataLayer ?? [];
  window.dataLayer = dataLayer;

  if (!window.gtag) {
    window.gtag = (...args: unknown[]) => {
      dataLayer.push(args);
    };
  }

  return window.gtag;
}

function injectScript(measurementId: string): void {
  const existing = document.querySelector(`script[src^="${GOOGLE_TAG_ORIGIN}/gtag/js?id="]`);
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `${GOOGLE_TAG_ORIGIN}/gtag/js?id=${encodeURIComponent(measurementId)}`;
  script.dataset.delirioGa4 = 'true';
  (document.head || document.body).appendChild(script);
}

/**
 * Loads the public GA4 tag once for the current page. Google Signals and ad
 * personalization remain disabled; this integration is for measurement, not
 * website remarketing or audience building.
 */
export function initGoogleAnalytics(explicitMeasurementId?: string): boolean {
  if (!isBrowser()) return false;
  if (configuredMeasurementId) return true;

  const measurementId = ga4MeasurementId(explicitMeasurementId);
  if (!measurementId) return false;

  const gtag = ensureGtag();
  injectScript(measurementId);
  gtag('js', new Date());
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  configuredMeasurementId = measurementId;

  return true;
}

/**
 * Sends one terminal website event per tab. This reports an App Store handoff,
 * not an install, account, trial, or purchase.
 */
export function recordAppStoreHandoff(attribution: Attribution): boolean {
  if (!isBrowser() || !initGoogleAnalytics()) return false;

  try {
    if (window.sessionStorage.getItem(APP_STORE_HANDOFF_STORAGE_KEY)) return false;
    window.sessionStorage.setItem(APP_STORE_HANDOFF_STORAGE_KEY, '1');
  } catch {
    // Storage denial may report a second click, which is preferable to silently
    // dropping the only website-to-App-Store measurement.
  }

  const parameters: Record<string, string> = {};
  if (attribution.source) parameters.acquisition_source = attribution.source;
  if (attribution.medium) parameters.acquisition_medium = attribution.medium;
  if (attribution.campaign) parameters.campaign_key = attribution.campaign;

  window.gtag?.('event', 'app_store_handoff', parameters);
  return true;
}

/** Test seam: clears the once-per-visit App Store handoff record. */
export function resetAppStoreHandoff(): void {
  try {
    window.sessionStorage.removeItem(APP_STORE_HANDOFF_STORAGE_KEY);
  } catch {
    // Nothing to clear when storage is unavailable.
  }
}

/** Test seam: clears module-level initialization state between isolated tests. */
export function resetGoogleAnalyticsInitialization(): void {
  configuredMeasurementId = null;
}
