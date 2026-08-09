import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WAITLIST_QUESTIONS } from '../../content/waitlistQuestions';
import {
  submitWaitlistAnswersToFirestore,
  submitWaitlistEmailToFirestore,
  updateWaitlistAnswersInFirestore,
} from '../../services/feedbackSubmission';
import { submitWishlistToFirestore } from '../../services/wishlistSubmission';
import { WaitlistModal } from './WaitlistModal';

jest.mock('../../services/feedbackSubmission', () => ({
  submitWaitlistAnswersToFirestore: jest.fn(),
  submitWaitlistEmailToFirestore: jest.fn(),
  updateWaitlistAnswersInFirestore: jest.fn(),
}));
jest.mock('../../services/wishlistSubmission', () => ({
  submitWishlistToFirestore: jest.fn(),
}));
jest.mock('../../utils/browserFeedbackId', () => ({
  getBrowserFeedbackId: () => 'browser_id_1234567890',
}));

const submitAnswersMock = jest.mocked(submitWaitlistAnswersToFirestore);
const submitEmailMock = jest.mocked(submitWaitlistEmailToFirestore);
const updateAnswersMock = jest.mocked(updateWaitlistAnswersInFirestore);
const submitWishlistMock = jest.mocked(submitWishlistToFirestore);

/** Picks each question's first option, one screen at a time. */
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
    submitEmailMock.mockReset().mockResolvedValue('waitlist-document-id');
    updateAnswersMock.mockReset().mockResolvedValue('waitlist-document-id');
    submitWishlistMock.mockReset().mockResolvedValue('waitlist-document-id');
    window.sessionStorage.clear();
  });

  afterEach(() => window.history.replaceState({}, '', '/'));

  /**
   * Microsoft Clarity records session replays site-wide, and masks only input
   * boxes and dropdowns by default. The questions are buttons, so without this
   * attribute the question text and the chosen option are uploaded and
   * replayable — the exact disclosure the reporting rules exist to prevent.
   *
   * Asserted on the outermost node so the whole gate is covered, and asserted
   * at all because nothing else would notice its removal: Clarity would simply
   * start recording, and only a session replay would ever show it.
   */
  it('keeps the whole gate masked from session recording', () => {
    const { baseElement } = render(<WaitlistModal open order="questions" startAtFirstQuestion />);

    const masked = baseElement.querySelector('[data-clarity-mask]');
    expect(masked).not.toBeNull();
    expect(masked).toContainElement(screen.getByRole('dialog'));
  });

  it('holds the email back until every question is answered', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open order="questions" startAtFirstQuestion />);

    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();

    await answerEverything(user);

    expect(await screen.findByRole('textbox', { name: /email address/i })).toBeInTheDocument();
  });

  it('records the answers before asking for the email at all', async () => {
    const user = userEvent.setup();
    render(<WaitlistModal open order="questions" startAtFirstQuestion />);

    await answerEverything(user);

    // The write happens on the last answer, so someone who closes the dialog at
    // the email box still counts as a read on demand.
    await waitFor(() => expect(submitAnswersMock).toHaveBeenCalledTimes(1));
    const [browserId, responses, order] = submitAnswersMock.mock.calls[0];
    expect(browserId).toBe('browser_id_1234567890');
    expect(order).toBe('questions');
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
    render(<WaitlistModal open order="questions" startAtFirstQuestion />);

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

  describe('one question per screen', () => {
    it('shows one question at a time and offers a way back', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      expect(screen.getAllByRole('radio')).toHaveLength(WAITLIST_QUESTIONS[0].options.length);
      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));

      expect(await screen.findByRole('heading', { name: WAITLIST_QUESTIONS[1].prompt })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /back/i }));
      expect(screen.getByRole('heading', { name: WAITLIST_QUESTIONS[0].prompt })).toBeInTheDocument();
    });

    it('introduces itself when the gate was not opened by a call to action', () => {
      render(<WaitlistModal open order="questions" />);

      expect(screen.getByRole('heading', { name: new RegExp(`${WAITLIST_QUESTIONS.length} questions, then your spot`, 'i') })).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });
  });

  describe('the open question', () => {
    it('never stands between the visitor and the email box', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

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
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

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
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      await answerEverything(user);
      const field = await screen.findByRole('textbox', { name: /90 days from now/i });
      await user.click(field);
      await user.tab();

      expect(updateAnswersMock).not.toHaveBeenCalled();
    });

    // The blur write is invisible, so on its own the field reads as one that
    // keeps nothing. These cover the button that says otherwise.
    it('offers nothing to press until there is something to send', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      await answerEverything(user);
      const send = await screen.findByRole('button', { name: /send answer/i });
      expect(send).toBeDisabled();

      await user.type(
        screen.getByRole('textbox', { name: /90 days from now/i }),
        'Two sessions a week.',
      );

      expect(send).toBeEnabled();
    });

    it('tells the visitor the text was kept', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      await answerEverything(user);
      await user.type(
        await screen.findByRole('textbox', { name: /90 days from now/i }),
        'Two sessions a week without dreading them.',
      );
      await user.click(screen.getByRole('button', { name: /send answer/i }));

      expect(await screen.findByText(/saved — thank you/i)).toBeInTheDocument();
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

    it('says so where the visitor is looking when that write failed', async () => {
      const user = userEvent.setup();
      updateAnswersMock.mockRejectedValue(new Error('permission denied'));
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      await answerEverything(user);
      await user.type(
        await screen.findByRole('textbox', { name: /90 days from now/i }),
        'Two sessions a week without dreading them.',
      );
      await user.click(screen.getByRole('button', { name: /send answer/i }));

      // Confirming a save that did not happen is the one thing a button like
      // this must never do.
      expect(await screen.findByText(/could not save that just now/i)).toBeInTheDocument();
      expect(screen.queryByText(/saved — thank you/i)).not.toBeInTheDocument();
    });

    it('drops the confirmation once the text changes again', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="questions" startAtFirstQuestion />);

      await answerEverything(user);
      const field = await screen.findByRole('textbox', { name: /90 days from now/i });
      await user.type(field, 'Two sessions a week.');
      await user.click(screen.getByRole('button', { name: /send answer/i }));
      expect(await screen.findByText(/saved — thank you/i)).toBeInTheDocument();

      await user.type(field, ' Without dreading them.');

      // "Saved" left standing over an edited answer is worse than no
      // confirmation at all — it is a claim about text nobody has.
      expect(screen.queryByText(/saved — thank you/i)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /send answer/i })).toBeEnabled();
    });
  });

  // Asserted with the non-default arm, so it is the query string being read and
  // not `DEFAULT_WAITLIST_ORDER` agreeing by coincidence.
  it('reads the experiment arm from the query string', () => {
    window.history.replaceState({}, '', '/?wo=questions');
    render(<WaitlistModal open />);

    // Questions-first opens on its intro, with no email box anywhere yet.
    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {
      name: new RegExp(`${WAITLIST_QUESTIONS.length} questions, then your spot`, 'i'),
    })).toBeInTheDocument();
  });

  // The shipping default, pinned here because it is what decides whether the
  // `email_submitted` conversion fires at all — see `config/waitlistOrder`.
  it('puts the email first when the query string says nothing', () => {
    render(<WaitlistModal open />);

    expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  });

  it('still takes the email when the answer write failed', async () => {
    const user = userEvent.setup();
    submitAnswersMock.mockRejectedValue(new Error('permission denied'));
    render(<WaitlistModal open order="questions" startAtFirstQuestion />);

    await answerEverything(user);
    const waitlist = within(await screen.findByRole('dialog'));
    // Announced, not just printed — the free text's own status line is the other
    // live region on this screen, which is why this asks for the text first.
    expect(await waitlist.findByText(/could not save your answers/i)).toHaveAttribute(
      'role',
      'status',
    );

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
    render(<WaitlistModal open onClose={onClose} startAtFirstQuestion />);

    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalled();
  });

  /** The `?wo=email` arm. See `config/waitlistOrder` for what it is testing. */
  describe('email-first arm', () => {
    async function join(user: ReturnType<typeof userEvent.setup>) {
      await user.type(screen.getByRole('textbox', { name: /email address/i }), 'person@example.com');
      await user.click(screen.getByRole('button', { name: /^join$/i }));
    }

    it('asks for the email before any question', async () => {
      render(<WaitlistModal open order="email" />);

      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('creates the record from the email, then moves on to the questions', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="email" />);

      await join(user);

      await waitFor(() => expect(submitEmailMock).toHaveBeenCalledWith(
        'browser_id_1234567890',
        'person@example.com',
        'email',
      ));
      expect(await screen.findByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }))
        .toBeInTheDocument();
    });

    /**
     * The arm's whole premise. Without a way out the questions are still a toll,
     * just one charged after the fact.
     */
    it('offers a way out of the questions on every screen', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="email" />);
      await join(user);

      const skip = await screen.findByRole('button', { name: /skip for now/i });
      await user.click(skip);

      expect(await screen.findByText(/you.re on the waitlist/i)).toBeInTheDocument();
      expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    });

    it('keeps answers given before the visitor skipped', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="email" />);
      await join(user);

      await user.click(await screen.findByRole('radio', { name: WAITLIST_QUESTIONS[0].options[0].label }));

      // Patched onto the record the email created, rather than held until the
      // set is complete — which it never will be if they skip next.
      await waitFor(() => expect(updateAnswersMock).toHaveBeenCalled());
      expect(submitAnswersMock).not.toHaveBeenCalled();
    });

    it('does not ask for the email a second time at the end', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="email" />);
      await join(user);
      await answerEverything(user);

      expect(await screen.findByText(/you.re on the waitlist/i)).toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    });

    /**
     * There is no `JOIN` on this screen — the address arrived seven screens ago
     * — so the free text is the only thing left to act on, and its own button is
     * the only thing that can tell the visitor it landed.
     */
    it('sends the free text from the closing screen, which has no other button', async () => {
      const user = userEvent.setup();
      render(<WaitlistModal open order="email" />);
      await join(user);
      await answerEverything(user);

      await user.type(
        await screen.findByRole('textbox', { name: /90 days from now/i }),
        'Two sessions a week without dreading them.',
      );
      await user.click(screen.getByRole('button', { name: /send answer/i }));

      expect(await screen.findByText(/saved — thank you/i)).toBeInTheDocument();
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
  });
});
