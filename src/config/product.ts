// Site-relative on purpose: on delirio.fit this resolves to https://delirio.fit/app,
// and on a Netlify deploy preview it stays on the preview domain. The /app ->
// App Store redirect itself lives in netlify.toml.
export const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL || '/app';

export const MONTHLY_PRICE_USD = 30;
export const YEARLY_PRICE_USD = 180;
export const YEARLY_MONTHLY_EQUIVALENT_USD = 15;
