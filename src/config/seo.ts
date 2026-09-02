export type SeoDefinition = {
  title: string;
  description: string;
  canonicalPath: string;
  robots: string;
  imagePath: string;
  schema: Record<string, unknown>[];
};

const SITE_URL = 'https://delirio.fit';
const DEFAULT_IMAGE_PATH = '/logo.png';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Delirio',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
};

const softwareApplicationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Delirio',
  applicationCategory: 'HealthApplication',
  operatingSystem: 'iOS',
  downloadUrl: 'https://apps.apple.com/us/app/delirio-ai-personal-trainer/id6756231078',
  description: 'An AI fitness coach for adaptive strength planning, workout guidance, and supported camera feedback.',
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Delirio',
  url: SITE_URL,
};

const definitions: Record<string, SeoDefinition> = {
  '/': {
    title: 'Delirio | AI Fitness Coach for Adaptive Strength Training',
    description: 'Delirio is an AI fitness coach for adaptive strength plans, live voice or text workout guidance, and supported camera-based form feedback.',
    canonicalPath: '/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, websiteSchema, softwareApplicationSchema],
  },
  '/support': {
    title: 'Delirio Support | Subscriptions, Accounts, and Help',
    description: 'Find help with Delirio subscriptions, accounts, data, and support contacts.',
    canonicalPath: '/support/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema],
  },
  '/terms-of-service': {
    title: 'Terms of Service | Delirio',
    description: 'Delirio terms of service.',
    canonicalPath: '/terms-of-service/',
    robots: 'noindex,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [],
  },
  '/privacy-policy': {
    title: 'Privacy Policy | Delirio',
    description: 'Delirio privacy policy and data practices.',
    canonicalPath: '/privacy-policy/',
    robots: 'noindex,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [],
  },
  '/data-deletion': {
    title: 'Data Deletion | Delirio',
    description: 'How to request deletion of your Delirio account and data.',
    canonicalPath: '/data-deletion/',
    robots: 'noindex,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [],
  },
};

export const seoPaths = Object.keys(definitions);

export function getSeoDefinition(pathname: string): SeoDefinition {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return definitions[normalizedPath] ?? definitions['/'];
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
