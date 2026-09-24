export const IS_DEV = import.meta.env.DEV;

/** Optional GA4 override; `ga4MeasurementId` falls back to the Firebase config's measurementId. */
export const GA4_MEASUREMENT_ID_OVERRIDE = (import.meta.env as Record<string, string | undefined>)
  .VITE_GA4_MEASUREMENT_ID;

/**
 * Ad configuration is deliberately absent from this file.
 *
 * The Meta dataset ID and access token live in `netlify/functions/conversion.mts`,
 * read from server-side environment variables. Nothing about the ad account
 * reaches the bundle: a `VITE_`-prefixed secret would be inlined into client
 * JavaScript at build time and published to anyone who opens devtools.
 */
