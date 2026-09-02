import { absoluteUrl, getSeoDefinition, seoPaths } from './seo';

describe('SEO route definitions', () => {
  it('contains only canonical, route-specific public SEO pages', () => {
    expect(seoPaths).toEqual(expect.arrayContaining([
      '/',
      '/support',
    ]));
    expect(seoPaths).not.toContain('/app');
  });

  it('keeps campaign variants on the homepage canonical and legal pages out of the index', () => {
    expect(getSeoDefinition('/').canonicalPath).toBe('/');
    expect(getSeoDefinition('/ai-fitness-coach/').canonicalPath).toBe('/');
    expect(getSeoDefinition('/terms-of-service').robots).toBe('noindex,follow');
    expect(absoluteUrl(getSeoDefinition('/').imagePath)).toBe('https://delirio.fit/logo.png');
  });
});
