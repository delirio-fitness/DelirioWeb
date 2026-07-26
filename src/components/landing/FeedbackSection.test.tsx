import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { FeedbackSection } from './FeedbackSection';

const server = setupServer();

describe('FeedbackSection', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

  afterEach(() => {
    jest.restoreAllMocks();
    server.resetHandlers();
    window.localStorage.clear();
  });

  afterAll(() => server.close());

  it('renders the first product question immediately', () => {
    render(<FeedbackSection />);

    expect(screen.getByRole('radio', { name: 'Build a personalized workout plan' })).toBeInTheDocument();
    expect(screen.getByLabelText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.queryByLabelText(/email|phone/i)).not.toBeInTheDocument();
  });

  it('auto-advances after one answer and provides Back in the card header', async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    await user.click(screen.getByRole('radio', { name: 'Build a personalized workout plan' }));
    expect(screen.getByRole('radio', { name: 'Build a personalized workout plan' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: 'More personalized guidance' })).not.toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: 'More personalized guidance' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('radio', { name: 'Build a personalized workout plan' })).toBeChecked();
  });

  it('posts valid feedback and reports persistence success', async () => {
    const user = userEvent.setup();
    let submittedPayload: Record<string, unknown> | null = null;
    server.use(http.post('/api/feedback', async ({ request }) => {
      submittedPayload = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ ok: true }, { status: 201 });
    }));
    window.localStorage.setItem('delirio_feedback_browser_id', 'browser_id_1234567890');
    render(<FeedbackSection />);

    for (const [answer, groupName] of [
      ['Build a personalized workout plan', 'wish'],
      ['More personalized guidance', 'coachingUsefulness'],
      ['Smarter workout planning', 'nextBuild'],
    ] as const) {
      const selectedOption = await screen.findByRole('radio', { name: answer });
      const questionOptions = screen.getAllByRole('radio');
      expect(questionOptions).toHaveLength(4);
      expect(questionOptions.every((option) => option.getAttribute('name') === groupName)).toBe(true);

      await user.click(selectedOption);
      expect(screen.getAllByRole('radio').filter((option) => (option as HTMLInputElement).checked)).toHaveLength(1);
    }

    await waitFor(() => expect(submittedPayload).not.toBeNull());
    expect(submittedPayload).toEqual(expect.objectContaining({
      browserId: 'browser_id_1234567890',
      wish: 'Build a personalized workout plan',
      coachingUsefulness: 'More personalized guidance',
      nextBuild: 'Smarter workout planning',
    }));
    expect(await screen.findByRole('status')).toHaveTextContent(/thank you/i);
  });
});
