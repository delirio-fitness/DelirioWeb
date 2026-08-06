export const IS_DEV = import.meta.env.DEV;

/**
 * Ad configuration is deliberately absent from this file.
 *
 * The Meta dataset ID and access token live in `netlify/functions/conversion.mts`,
 * read from server-side environment variables. Nothing about the ad account
 * reaches the bundle: a `VITE_`-prefixed secret would be inlined into client
 * JavaScript at build time and published to anyone who opens devtools.
 */
