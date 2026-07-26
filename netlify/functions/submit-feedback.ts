import type { Config } from '@netlify/functions';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

type FeedbackPayload = {
  browserId?: unknown;
  wish?: unknown;
  coachingUsefulness?: unknown;
  nextBuild?: unknown;
  website?: unknown;
};

const responseHeaders = {
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: responseHeaders });
}

function requiredAnswer(value: unknown, label: string) {
  if (typeof value !== 'string') throw new Error(`${label} is required.`);
  const answer = value.trim();
  if (!answer) throw new Error(`${label} is required.`);
  if (answer.length > 2000) throw new Error(`${label} must be 2,000 characters or fewer.`);
  return answer;
}

function getServiceAccount(): ServiceAccount {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as ServiceAccount;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('Firebase service account environment variables are not configured.');
  }

  return { projectId, clientEmail, privateKey };
}

function getFeedbackDatabase() {
  const app = getApps().find(({ name }) => name === 'delirio-feedback')
    ?? initializeApp({ credential: cert(getServiceAccount()) }, 'delirio-feedback');
  return getFirestore(app);
}

export default async (request: Request) => {
  if (request.method !== 'POST') return json(405, { error: 'Method not allowed.' });

  let payload: FeedbackPayload;
  try {
    payload = await request.json() as FeedbackPayload;
  } catch {
    return json(400, { error: 'Invalid request body.' });
  }

  // Honeypot submissions receive a generic success without touching Firestore.
  if (typeof payload.website === 'string' && payload.website.trim()) {
    return json(200, { ok: true });
  }

  if (typeof payload.browserId !== 'string' || !/^[a-zA-Z0-9_-]{16,80}$/.test(payload.browserId)) {
    return json(400, { error: 'A valid browser identifier is required.' });
  }

  try {
    const answers = {
      wish: requiredAnswer(payload.wish, 'The first answer'),
      coachingUsefulness: requiredAnswer(payload.coachingUsefulness, 'The second answer'),
      nextBuild: requiredAnswer(payload.nextBuild, 'The third answer'),
    };
    return await saveFeedback(payload.browserId, answers);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid feedback submission.';
    return json(400, { error: message });
  }
};

async function saveFeedback(
  browserId: string,
  answers: { wish: string; coachingUsefulness: string; nextBuild: string },
) {
  try {
    const document = await getFeedbackDatabase().collection('warmNetwork').add({
      browserId,
      answers,
      source: 'delirio-website-feedback',
      schemaVersion: 1,
      createdAt: FieldValue.serverTimestamp(),
    });

    return json(201, { ok: true, id: document.id });
  } catch (error) {
    console.error('[submit-feedback]', error);
    return json(500, { error: 'Unable to submit feedback right now.' });
  }
}

export const config: Config = {
  path: '/api/feedback',
  method: 'POST',
  rateLimit: {
    windowLimit: 5,
    windowSize: 60,
    aggregateBy: ['ip'],
  },
};
