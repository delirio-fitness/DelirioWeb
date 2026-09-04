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

/**
 * FAQPage structured data for Google rich results.
 *
 * Only a representative subset of questions is included here. Google recommends
 * keeping FAQ schema to the most important questions rather than dumping every
 * question on the page — it keeps the JSON-LD payload small and signals which
 * answers are most relevant. The full FAQ remains in the visible page content.
 *
 * These must stay in sync with the visible FAQ in `src/pages/Landing.tsx`. If a
 * question is reworded or removed there, update it here too.
 */
const faqPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this actually AI or a set of canned responses?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Delirio uses live AI to respond to your conversation and the workout context available to it. Responses are not selected from a fixed script, but AI can still misunderstand or make mistakes. You remain in control of important training decisions.',
      },
    },
    {
      '@type': 'Question',
      name: 'What can Delirio assess through the camera?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'With the camera on, Delirio uses pose estimation to assess supported movements and visible movement details. Camera angle, lighting, clothing, and whether your full body is visible can limit what it can assess. It provides fitness guidance, not injury assessment or medical diagnosis.',
      },
    },
    {
      '@type': 'Question',
      name: "What's the difference between Reed and Iris?",
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Reed is focused and structured. Iris is attentive and encouraging. Choose the style that helps you feel clear and supported; you can switch coaches later. Both use the training context available in Delirio.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Delirio replace a personal trainer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Delirio can create and adapt your plan, guide workouts, support reflection, and follow up. It is not a certified personal trainer or medical professional, cannot physically spot you, and does not diagnose pain or injury. You can also use it alongside a human trainer.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long are the workouts?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "That depends on you. Your coach builds around the time you have. If you've got 30 minutes, you get a 30-minute session. If you've got an hour, you get an hour. No filler.",
      },
    },
    {
      '@type': 'Question',
      name: 'Why pay $30/month?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Delirio is $30 billed monthly, or $180 billed annually\u2014equivalent to $15 per month\u2014for adaptive planning, workout guidance, form feedback where supported, and conversation between sessions.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I cancel anytime?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. No contracts, no cancellation fees.',
      },
    },
  ],
};

const definitions: Record<string, SeoDefinition> = {
  '/': {
    title: 'Delirio | AI Fitness Coach for Adaptive Strength Training',
    description: 'Delirio is an AI fitness coach for adaptive strength plans, live voice or text workout guidance, and supported camera-based form feedback.',
    canonicalPath: '/',
    robots: 'index,follow',
    imagePath: DEFAULT_IMAGE_PATH,
    schema: [organizationSchema, websiteSchema, softwareApplicationSchema, faqPageSchema],
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
