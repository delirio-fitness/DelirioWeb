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
  '/ai-fitness-coach': {
    title: 'AI Fitness Coach | Adaptive Strength Training with Delirio',
    description: 'Learn how Delirio’s AI fitness coach adapts strength training around your schedule, equipment, and workout context.',
    canonicalPath: '/ai-fitness-coach/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, softwareApplicationSchema],
  },
  '/adaptive-workout-planner': {
    title: 'Adaptive Workout Planner | Delirio AI Fitness Coaching',
    description: 'See how an adaptive workout planner can adjust a strength session when your time, equipment, or training week changes.',
    canonicalPath: '/adaptive-workout-planner/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, softwareApplicationSchema],
  },
  '/voice-workout-coach': {
    title: 'Voice Workout Coach | Live AI Fitness Guidance | Delirio',
    description: 'Explore Delirio’s voice and text workout guidance, designed to help you follow, adjust, and reflect on a strength session.',
    canonicalPath: '/voice-workout-coach/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, softwareApplicationSchema],
  },
  '/workout-form-feedback': {
    title: 'Workout Form Feedback | Camera-Based Guidance by Delirio',
    description: 'Understand what camera-based workout form feedback can support, its limits, and how Delirio keeps you in control.',
    canonicalPath: '/workout-form-feedback/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, softwareApplicationSchema],
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
  return definitions[pathname] ?? definitions['/'];
}

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
