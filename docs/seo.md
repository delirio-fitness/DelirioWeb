# SEO Operations

## What ships in the static build

`npm run build` produces pre-rendered HTML for the homepage, support page,
legal pages, and four product guides. Route metadata is defined in
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
   the homepage and one guide, and confirm rendered HTML and the selected
   canonical match the URL.
3. Review Core Web Vitals after field data accumulates: LCP ≤2.5s, INP <200ms,
   and CLS <0.1.
4. Do not publish health- or GLP-1-specific editorial pages without qualified
   clinical and legal review.
