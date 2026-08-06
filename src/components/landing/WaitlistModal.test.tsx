import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WAITLIST_QUESTIONS } from '../../content/waitlistQuestions';
import {
  submitWaitlistAnswersToFirestore,
  updateWaitlistAnswersInFirestore,
} from '../../services/feedbackSubmission';
import { submitWishlistToFirestore } from '../../services/wishlistSubmission';
import { WaitlistModal } from './WaitlistModal';

jest.mock('../../services/feedbackSubmission', () => ({
  submitWaitlistAnswersToFirestore: jest.fn(),
  updateWaitlistAnswersInFirestore: jest.fn(),
}));
jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn(),
}));
jest.mock('../../utils/browserFeedbackId', () => ({
  getBrowserFeedbackId: () => 'browser_id_1234567890',
}));

const submitAnswersMock = jest.mocked(submitWaitlistAnswersToFirestore);
const updateAnswersMock = jest.mocked(updateWaitlistAnswersInFirestore);
const submitWishlistMock = jest.mocked(submitWishlistToFirestore);

/** The locked panel's countdown, derived so a changed question set still matches. */
const lockedCopy = (remaining: number) =>
  new RegExp(`${remaining} questions? left to unlock your spot`, 'i');

/** Picks each question's first option, in whatever design is on screen. */
async function answerEverything(user: ReturnType<typeof userEvent.setup>) {
  for (const question of WAITLIST_QUESTIONS) {
    const option = question.options[0];
    await user.click(await screen.findByRole('radio', { name: option.label }));
  }
}

describe('WaitlistModal', () => {
  jest.setTimeout(15_000);

  beforeEach(() => {
    submitAnswersMock.mockReset().mockResolvedValue('waitlist-document-id');
    updateAnswersMock.mockReset().mockResolvedValue('waitlist-document-id');
    submitWishlistMock.mockReset().mockResolvedValue('waitlist-document-id');
    window.sessionStorage.clear();
  });

  afterEach(() => window.history.replaceState({}, '', '/'));

  it('holds the email back until every question is answered', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open design="steps" startAtFirstQuestion />);

    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();

    await answerEverything(user);

    expect(await screen.findByRole('textbox', { name: /email address/i })).toBeInTheDocument();
  });

  it('records the answers before asking for the email at all', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open design="steps" startAtFirstQuestion />);

    await answerEverything(user);

    // The write happens on the last answer, so someone who closes the dialog at
    // the email box still counts as a read on demand.
    await waitFor(() => expect(submitAnswersMock).toHaveBeenCalledTimes(1));
    const [browserId, responses, design] = submitAnswersMock.mock.calls[0];
    expect(browserId).toBe('browser_id_1234567890');
    expect(design).toBe('steps');
    expect(responses).toHaveLength(WAITLIST_QUESTIONS.length);
    expect(responses[0]).toEqual({
      id: WAITLIST_QUESTIONS[0].id,
      kind: 'choice',
      question: WAITLIST_QUESTIONS[0].prompt,
      answer: WAITLIST_QUESTIONS[0].options[0].label,
      value: WAITLIST_QUESTIONS[0].options[0].value,
    });
    expect(submitWishlistMock).not.toHaveBeenCalled();
  });

  it('attaches the email to the answers it followed', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open design="steps" startAtFirstQuestion />);

    await answerEverything(user);
    await user.type(
      await screen.findByRole('textbox', { name: /email address/i }),
      'person@example.com',
    );
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      { submissionId: 'waitlist-document-id' },
    ));
  });

  describe('stepped design', () => {
    it('shows one question at a time and offers a way back', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="steps" startAtFirstQuestion />);

      expect(screen.getAllByRole('radio')).toHaveLength(WAITLIST_QUESTIONS[0].options.length);
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));

      expect(await screen.findByRole('heading', { name: WAITLIST_QUESTIONS[1].prompt })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByRole('heading', { name: WAITLIST_QUESTIONS[0].prompt })).toBeInTheDocument();
    });

    it('introduces itself when the gate was not opened by a call to action', () => {
      render(<WaitlistModal open design="steps" />);

      expect(screen.getByRole('heading', { name: new RegExp(`${WAITLIST_QUESTIONS.length} questions, then your spot`, 'i') })).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
  });

  describe('single-page design', () => {
    it('shows every question at once behind a locked email box', () => {
      render(<WaitlistModal open design="single" />);

      for (const question of WAITLIST_QUESTIONS) {
        expect(screen.getByText(question.prompt)).toBeInTheDocument();
      }
      expect(screen.getByText(lockedCopy(WAITLIST_QUESTIONS.length))).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    });

    it('counts down as the questions are answered', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="single" />);

      await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));
      expect(screen.getByText(lockedCopy(WAITLIST_QUESTIONS.length - 1))).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[1].options[0].label }));
      expect(screen.getByText(lockedCopy(WAITLIST_QUESTIONS.length - 2))).toBeInTheDocument();
    });

    it('rewrites the record rather than forking it when an answer changes late', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="single" />);

      await answerEverything(user);
      await waitFor(() => expect(submitAnswersMock).toHaveBeenCalledTimes(1));

      // Every question stays editable here, unlike the stepped design.
      await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[1].label }));

      await waitFor(() => expect(updateAnswersMock).toHaveBeenCalledWith(
        'waitlist-document-id',
        expect.arrayContaining([
          expect.objectContaining({ value: WAITLIST_QUESTIONS[0].options[1].value }),
        ]),
      ));
      expect(submitAnswersMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('the open question', () => {
    it('never stands between the visitor and the email box', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="steps" startAtFirstQuestion />);

      await answerEverything(user);

      // Both appear together, and the email works with the textarea untouched.
      expect(await screen.findByRole('textbox', { name: /90 days from now/i })).toBeInTheDocument();
      await user.type(
        screen.getByRole('textbox', { name: /email address/i }),
        'person@example.com',
      );
      await user.click(screen.getByRole('button', { name: /^join$/i }));

      await waitFor(() => expect(submitWishlistMock).toHaveBeenCalled());
      // Nothing empty was written into the record.
      const written = submitAnswersMock.mock.calls[0][1];
      expect(written.some((response) => response.kind === 'text')).toBe(false);
    });

    it('attaches an answer to the record once the field is left', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="steps" startAtFirstQuestion />);

      await answerEverything(user);
      await user.type(
        await screen.findByRole('textbox', { name: /90 days from now/i }),
        'Two sessions a week without dreading them.',
      );

      // Still only the one write: typing must not spend a request per keystroke.
      expect(updateAnswersMock).not.toHaveBeenCalled();

      await user.tab();

      await waitFor(() => expect(updateAnswersMock).toHaveBeenCalledWith(
        'waitlist-document-id',
        expect.arrayContaining([
          expect.objectContaining({
            kind: 'text',
            answer: 'Two sessions a week without dreading them.',
          }),
        ]),
      ));
    });

    it('does not spend a write when the field is left untouched', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open design="steps" startAtFirstQuestion />);

      await answerEverything(user);
      const field = await screen.findByRole('textbox', { name: /90 days from now/i });
      await user.click(field);
      await user.tab();

      expect(updateAnswersMock).not.toHaveBeenCalled();
    });
  });

  it('reads the design from the query string', async () => {
    window.history.replaceState({}, '', '/?wl=single');
    render(<WaitlistModal open />);

    expect(screen.getByText(lockedCopy(WAITLIST_QUESTIONS.length))).toBeInTheDocument();
  });

  it('still takes the email when the answer write failed', async () => {
    const user = userEvent.setup();
    submitAnswersMock.mockRejectedValue(new Error('permission denied'));
    render(<WaitlistModal open design="steps" startAtFirstQuestion />);

    await answerEverything(user);
    const waitlist = within(await screen.findByRole('dialog'));
    expect(await waitlist.findByRole('status')).toHaveTextContent(/could not save your answers/i);

    await user.type(
      screen.getByRole('textbox', { name: /email address/i }),
      'person@example.com',
    );
    await user.click(screen.getByRole('button', { name: /^join$/i }));

    // No submission id to attach to, so it lands as a standalone record instead
    // of being dropped.
    await waitFor(() => expect(submitWishlistMock).toHaveBeenCalledWith(
      'browser_id_1234567890',
      'person@example.com',
      'questionnaire',
      undefined,
    ));
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<WaitlistModal open onClose={onClose} design="steps" startAtFirstQuestion />);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });
});
