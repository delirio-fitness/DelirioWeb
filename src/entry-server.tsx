import { renderToStaticMarkup } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { AppRoutes } from './App';
import { absoluteUrl, getSeoDefinition } from './config/seo';

export function renderRoute(pathname: string) {
  const seo = getSeoDefinition(pathname);
  return {
    appHtml: renderToStaticMarkup(
      <StaticRouter location={pathname}>
        <AppRoutes />
      </StaticRouter>,
    ),
    seo: {
      ...seo,
      canonical: absoluteUrl(seo.canonicalPath),
      image: absoluteUrl(seo.imagePath),
    },
  };
}
