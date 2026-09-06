/**
 * Public GA4 web-stream identifier for delirio.fit.
 *
 * A Measurement ID is an identifier embedded in every Google tag, not a
 * credential. Netlify may override it with VITE_GA4_MEASUREMENT_ID for a
 * separate deployment, but the production stream remains explicit here just
 * like the existing public Clarity project ID.
 */
export const GA4_MEASUREMENT_ID = 'G-HJ752JWYKT';

/** Returns the measurement ID only when it has the expected public GA4 form. */
export function ga4MeasurementId(): string | null {
  const fromEnvironment = (
    import.meta.env as Record<string, string | undefined>
  ).VITE_GA4_MEASUREMENT_ID?.trim();
  const candidate = fromEnvironment || GA4_MEASUREMENT_ID;

  return /^G-[A-Z0-9]+$/.test(candidate) ? candidate : null;
}
