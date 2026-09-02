# SEO Operations

## What ships in the static build

`npm run build` produces pre-rendered HTML for the homepage, support page, and
legal pages. Route metadata is defined in
`src/config/seo.ts`; the build emits the title, description, robots directive,
canonical URL, social tags, and applicable JSON-LD.

Run these checks before release:

```bash
npm run typecheck
npm run build
npm run test:seo
```

`public/robots.txt` and `public/sitemap.xml` remain deliberately small static
files. Add a route to both `src/config/seo.ts` and the sitemap only when it is
intended to be indexed. Never add `/app` or noindex legal pages to the sitemap.

## Netlify routing

Public routes are static files after the build, so `public/_redirects` contains
only redirects. It intentionally has no SPA fallback: serving every unknown
URL with `index.html` would create a soft 404 for search engines.

Do not add trailing-slash redirects for pre-rendered directory routes. Netlify
normalizes their no-slash form to a trailing slash, and an explicit
slash-to-no-slash redirect loops on the deployed site. Use trailing-slash
canonical tags and sitemap entries for those routes.

Do not depend on `netlify.toml` until the production base-directory issue has
been fixed and verified on the deployed site.

## Human checks after deployment

1. Verify each sitemap URL and `/robots.txt` directly on `https://delirio.fit`.
2. In Google Search Console, submit `https://delirio.fit/sitemap.xml`, inspect
   the homepage and support page, and confirm rendered HTML and the selected
   canonical match the URL.
3. Review Core Web Vitals after field data accumulates: LCP ≤2.5s, INP <200ms,
   and CLS <0.1.
4. Do not publish health- or GLP-1-specific editorial pages without qualified
   clinical and legal review.

## Organic conversion measurement

Microsoft Clarity receives a coarse `acquisition_channel` session tag on every
landing visit. An `organic_search_app_store_handoff` event is emitted once per
visit only when the visitor arrived from a recognized search engine and then
chooses an App Store CTA. It represents an App Store handoff, not a confirmed
install.

The implementation intentionally does not use the Meta conversion endpoint or
modify its payload. Paid UTM and Meta-click (`fbclid`) visits are labelled
`paid_campaign` and excluded from the organic handoff event. Clarity receives
only the coarse channel and, for organic search, the search-engine name; it
does not receive the URL, query, campaign values, or referrer through this
feature.

In Clarity, filter recordings/heatmaps by `acquisition_channel =
organic_search`, then review the `organic_search_app_store_handoff` custom
event. Compare it with the count of organic-search sessions to calculate the
on-site search-to-App-Store handoff rate. Do not call this install conversion:
join it to app-side attribution/analytics only after that data source is
available.
