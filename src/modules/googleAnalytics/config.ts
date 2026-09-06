/**
 * Resolves the public GA4 web-stream identifier for delirio.fit.
 *
 * The production value is already available to the Vite build as the Firebase
 * web configuration's `measurementId`. Do not duplicate it in source: Netlify
 * correctly treats the build variable as protected and rejects that copy.
 */
/** Returns the measurement ID only when it has the expected public GA4 form. */
export function ga4MeasurementId(explicitId?: string): string | null {
  const fromEnvironment = (
    import.meta.env as Record<string, string | undefined>
  ).VITE_GA4_MEASUREMENT_ID?.trim();
  const fromFirebaseConfig =
    typeof __FIREBASE_WEB_CONFIG__ === 'undefined'
      ? undefined
      : __FIREBASE_WEB_CONFIG__.measurementId?.trim();
  const candidate = explicitId?.trim() || fromEnvironment || fromFirebaseConfig;

  return candidate && /^G-[A-Z0-9]+$/.test(candidate) ? candidate : null;
}
