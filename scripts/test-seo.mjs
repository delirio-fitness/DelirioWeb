import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const routes = [
  '/',
  '/ai-fitness-coach',
  '/adaptive-workout-planner',
  '/voice-workout-coach',
  '/workout-form-feedback',
  '/support',
  '/terms-of-service',
  '/privacy-policy',
  '/data-deletion',
];

for (const route of routes) {
  const file = route === '/' ? resolve(root, 'build/index.html') : resolve(root, `build${route}/index.html`);
  const html = await readFile(file, 'utf8');
  if (!/<link rel="canonical" href="https:\/\/delirio\.fit\//.test(html)) throw new Error(`${route} has no canonical URL`);
  if (!/<meta name="robots" content="(?:index|noindex),follow">/.test(html)) throw new Error(`${route} has no robots directive`);
  if (!/<meta property="og:title"/.test(html)) throw new Error(`${route} has no Open Graph title`);
  if ((html.match(/rel="canonical"/g) ?? []).length !== 1) throw new Error(`${route} has more than one canonical URL`);
  if (html.includes('<div id="root"></div>')) throw new Error(`${route} was not pre-rendered`);
}

const robots = await readFile(resolve(root, 'build/robots.txt'), 'utf8');
const sitemap = await readFile(resolve(root, 'build/sitemap.xml'), 'utf8');
if (!robots.includes('Sitemap: https://delirio.fit/sitemap.xml')) throw new Error('robots.txt does not name the sitemap');
if (!sitemap.includes('https://delirio.fit/ai-fitness-coach')) throw new Error('sitemap is missing an indexable content page');
if (sitemap.includes('terms-of-service') || sitemap.includes('/app')) throw new Error('sitemap contains a noindex page');

console.log(`SEO build checks passed for ${routes.length} rendered routes.`);
