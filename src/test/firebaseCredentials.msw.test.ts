import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { loadFirebaseWebTestConfig } from './firebaseTestConfig';

const firebaseConfig = loadFirebaseWebTestConfig();
const describeWithFirebaseSecrets = firebaseConfig ? describe : describe.skip;
const server = setupServer();

describeWithFirebaseSecrets('Firebase credentials through MSW', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('loads the ignored config and threads it into the Firestore REST request', async () => {
    if (!firebaseConfig) throw new Error('Firebase test configuration was not loaded.');

    const endpoint = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/webQuestionaire`;
    let intercepted = false;
    server.use(http.post(/https:\/\/firestore\.googleapis\.com\/v1\/projects\/.+\/databases\/\(default\)\/documents\/webQuestionaire/, async ({ request }) => {
      intercepted = true;
      const url = new URL(request.url);
      expect(url.pathname).toContain(`/projects/${firebaseConfig.projectId}/`);
      expect(url.searchParams.get('key')).toBe(firebaseConfig.apiKey);
      expect(firebaseConfig.appId).toBeTruthy();
      expect(await request.json()).toEqual(expect.objectContaining({ fields: expect.any(Object) }));
      return HttpResponse.json({ name: `${url.pathname}/mock-submission` });
    }));

    const response = await fetch(`${endpoint}?key=${encodeURIComponent(firebaseConfig.apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: { source: { stringValue: 'delirio-website-feedback' } } }),
    });
    expect(response.status).toBe(200);
    expect(intercepted).toBe(true);
  });
});
