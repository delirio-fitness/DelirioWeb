import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const clientBuild = resolve(root, 'build');
const serverBuild = resolve(root, 'build-ssr');
const routes = [
  '/',
  '/support',
  '/terms-of-service',
  '/privacy-policy',
  '/data-deletion',
];

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

function meta(name, content, property = false) {
  return `<meta ${property ? 'property' : 'name'}="${name}" content="${escapeHtml(content)}">`;
}

function headFor(seo) {
  const schema = seo.schema.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, '\\u003c')}</script>`).join('\n      ');
  return [
    `<title>${escapeHtml(seo.title)}</title>`,
    meta('description', seo.description),
    meta('robots', seo.robots),
    `<link rel="canonical" href="${seo.canonical}">`,
    meta('og:title', seo.title, true),
    meta('og:description', seo.description, true),
    meta('og:type', 'website', true),
    meta('og:url', seo.canonical, true),
    meta('og:image', seo.image, true),
    meta('twitter:card', 'summary_large_image'),
    meta('twitter:title', seo.title),
    meta('twitter:description', seo.description),
    meta('twitter:image', seo.image),
    schema,
  ].join('\n      ');
}

const template = await readFile(resolve(clientBuild, 'index.html'), 'utf8');
const { renderRoute } = await import(pathToFileURL(resolve(serverBuild, 'entry-server.js')).href);

for (const route of routes) {
  const { appHtml, seo } = renderRoute(route);
  const withoutDefaultSeo = template
    .replace(/<title>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<meta\s+(?:name|property)="(?:description|robots|twitter:[^"]+|og:[^"]+)"[^>]*>\s*/g, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/g, '');
  const document = withoutDefaultSeo
    .replace('</head>', `      ${headFor(seo)}\n    </head>`)
    .replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
  const destination = route === '/' ? resolve(clientBuild, 'index.html') : resolve(clientBuild, route.slice(1), 'index.html');
  await mkdir(resolve(destination, '..'), { recursive: true });
  await writeFile(destination, document);
}

await rm(serverBuild, { recursive: true, force: true });
