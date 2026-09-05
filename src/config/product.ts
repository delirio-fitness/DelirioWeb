// Site-relative on purpose: on delirio.fit this resolves to https://delirio.fit/app,
// and on a Netlify deploy preview it stays on the preview domain. The /app rewrite
// lives in `public/_redirects` — NOT `netlify.toml`, which production ignores — and
// serves `public/app.html`, the interstitial that holds the real Apple URL.
//
// Reach it through `AppStoreLink`, never by pasting this constant into an `<a>`:
// the component is what attaches the `store_click` conversion.
export const APP_STORE_URL = import.meta.env.VITE_APP_STORE_URL || '/app';

// The founding rate is what the app sells; the list prices are the standard rate it
// strikes through beside each plan. Both pairs must match App Store Connect and the
// iOS compiled default (`PricingOffer.founding`), and the Terms page names all four.
export const FOUNDING_MONTHLY_PRICE_USD = 4.99;
export const FOUNDING_YEARLY_PRICE_USD = 29.99;
export const LIST_MONTHLY_PRICE_USD = 29.99;
export const LIST_YEARLY_PRICE_USD = 179.99;

// The landing page's plan cards still render the list rate; see the Terms for the founding rate.
export const MONTHLY_PRICE_USD = 30;
export const YEARLY_PRICE_USD = 180;
export const YEARLY_MONTHLY_EQUIVALENT_USD = 15;
