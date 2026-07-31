import { useState } from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { submitFeedbackToFirestore } from '../../services/feedbackSubmission';
import { FeedbackSection } from './FeedbackSection';

jest.mock('../../services/feedbackSubmission', () => ({
  submitFeedbackToFirestore: jest.fn(),
}));

const submitFeedbackMock = jest.mocked(submitFeedbackToFirestore);

describe('FeedbackSection', () => {
  jest.setTimeout(15_000);

  function FeedbackHarness() {
    const [open, setOpen] = useState(false);
    const [invocationId, setInvocationId] = useState(0);

    return (
      <>
        <button
          type="button"
          onClick={() => {
            setInvocationId((current) => current + 1);
            setOpen(true);
          }}
        >
          Shape What’s Next
        </button>
        <FeedbackSection invocationId={invocationId} open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  async function openQuestionnaire(startQuiz = true) {
    const user = userEvent.setup();
    render(<FeedbackSection open />);
    if (startQuiz) await user.click(screen.getByRole('button', { name: /take the 60-second quiz/i }));
    return user;
  }

  afterEach(() => {
    jest.restoreAllMocks();
    submitFeedbackMock.mockReset();
    window.localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('introduces the questionnaire before showing the GLP-1 filter', async () => {
    const user = await openQuestionnaire(false);

    expect(screen.getByRole('dialog')).toHaveTextContent(/see what could make staying fit feel easier/i);
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /take the 60-second quiz/i }));

    expect(screen.getByRole('dialog', { name: /is a glp-1 medication/i })).toHaveAttribute(
      'aria-modal',
      'true',
    );
    expect(
      screen.getByRole('heading', {
        name: /is a glp-1 medication currently part of your routine/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.getByLabelText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.queryByText('1/5')).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Prefer not to say' })).toBeInTheDocument();
    expect(screen.queryByLabelText(/email|phone/i)).not.toBeInTheDocument();
  });

  it('can open directly on the first question', () => {
    render(<FeedbackSection open startAtFirstQuestion />);

    expect(
      screen.getByRole('heading', {
        name: /is a glp-1 medication currently part of your routine/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /take the 60-second quiz/i })).not.toBeInTheDocument();
  });

  it('extends the denominator only when an answer reveals another question', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'Yes, I’m currently taking one' }));
    expect(await screen.findByLabelText('Question 2 of 6')).toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: 'Actively losing weight' }));
    expect(await screen.findByLabelText('Question 3 of 7')).toBeInTheDocument();
  });

  it('keeps the five-question denominator when the first answer creates no follow-up', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'Prefer not to say' }));
    expect(await screen.findByLabelText('Question 2 of 5')).toBeInTheDocument();
  });

  it('auto-advances after one answer and provides Back in the card header', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'Prefer not to say' }));
    expect(screen.getByRole('radio', { name: 'Prefer not to say' })).toBeChecked();
    expect(
      await screen.findByRole('radio', {
        name: 'I stay active, but planning it takes too much effort',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('radio', { name: 'Prefer not to say' })).toBeChecked();
  });

  it('captures the GLP-1 phase and prunes that branch when the root answer changes', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'Yes, I’m currently taking one' }));
    await user.click(await screen.findByRole('radio', { name: 'Actively losing weight' }));
    expect(
      await screen.findByRole('radio', { name: 'My energy feels less predictable' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /back/i }));
    await user.click(screen.getByRole('button', { name: /back/i }));
    await user.click(screen.getByRole('radio', { name: 'Prefer not to say' }));

    expect(
      await screen.findByRole('radio', {
        name: 'I stay active, but planning it takes too much effort',
      }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('radio', { name: 'My energy feels less predictable' }),
    ).not.toBeInTheDocument();
  });

  it('conditions follow-ups on restarting, failed guidance, and the moment support breaks down', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'Prefer not to say' }));
    await user.click(
      await screen.findByRole('radio', {
        name: 'I want to return, but it feels harder than it should',
      }),
    );
    await user.click(
      await screen.findByRole('radio', { name: 'One missed day turns into several' }),
    );
    expect(
      await screen.findByRole('radio', { name: 'The plan feels too big to begin' }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'The plan feels too big to begin' }));

    await user.click(await screen.findByRole('radio', { name: 'Yes, a person or program did' }));
    expect(await screen.findByRole('radio', { name: 'It felt too generic' })).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: 'It disappeared once I fell behind' }));

    await user.click(await screen.findByRole('radio', { name: 'When I get unsure mid-workout' }));
    expect(
      await screen.findByRole('radio', { name: 'I stop to search for an answer' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('radio').length).toBeLessThanOrEqual(4);
  });

  it('posts one answer per question in the Firestore-compatible envelope', async () => {
    submitFeedbackMock.mockResolvedValue('firestore-document-id');
    window.localStorage.setItem('delirio_feedback_browser_id', 'browser_id_1234567890');
    const user = await openQuestionnaire();

    const questionnaireAnswers = [
      'No',
      'Not really',
      'I stay active, but planning it takes too much effort',
      'My schedule changes at the last minute',
      'I have not tried coaching',
      'Appointments do not fit my schedule',
      'When planning the week',
      'It gets pushed to later',
      'Wasting the limited time I have',
    ];

    for (const [index, answer] of questionnaireAnswers.entries()) {
      const selectedOption = await screen.findByRole('radio', { name: answer });
      expect(screen.getAllByRole('radio').length).toBeLessThanOrEqual(4);
      await user.click(selectedOption);
      if (index < questionnaireAnswers.length - 1) {
        expect(
          screen.getAllByRole('radio').filter((option) => (option as HTMLInputElement).checked),
        ).toHaveLength(1);
      }
    }

    expect(screen.getByRole('status')).toHaveTextContent(
      /consulting the committee about what will work for you/i,
    );
    expect(screen.queryByText(/saving your answers/i)).not.toBeInTheDocument();

    await waitFor(() => expect(submitFeedbackMock).toHaveBeenCalledTimes(1));
    const [browserId, payload] = submitFeedbackMock.mock.calls[0];
    expect(browserId).toBe('browser_id_1234567890');
    expect(JSON.parse(payload.wish)).toEqual({
      questionnaireVersion: 6,
      glp1Context: 'no',
      routineDisruption: 'not_really',
      responses: [
        {
          question: 'Is a GLP-1 medication currently part of your routine?',
          answer: 'No',
        },
        {
          question: 'Has a change in your body, energy, or schedule ever disrupted your training?',
          answer: 'Not really',
        },
      ],
    });
    expect(JSON.parse(payload.coachingUsefulness)).toEqual({
      trainingPattern: 'planning_load',
      momentumBarrier: 'schedule_changes',
      guidanceHistory: 'never',
      coachingHesitation: 'appointments',
      responses: [
        {
          question: 'Which training pattern feels closest to your life right now?',
          answer: 'I stay active, but planning it takes too much effort',
        },
        {
          question: 'What tends to break your momentum first?',
          answer: 'My schedule changes at the last minute',
        },
        {
          question: 'Has fitness guidance ever let you down?',
          answer: 'I have not tried coaching',
        },
        {
          question: 'What has made coaching feel hard to try?',
          answer: 'Appointments do not fit my schedule',
        },
      ],
    });
    expect(JSON.parse(payload.nextBuild)).toEqual({
      unsupportedMoment: 'when_planning_the_week',
      copingResponse: 'it_gets_pushed_to_later',
      painfulConsequence: 'wasting_the_limited_time_i_have',
      responses: [
        {
          question: 'When do you feel most on your own with fitness?',
          answer: 'When planning the week',
        },
        {
          question: 'When your week changes, what usually happens to the workout plan?',
          answer: 'It gets pushed to later',
        },
        {
          question: 'Which consequence of this pattern bothers you most?',
          answer: 'Wasting the limited time I have',
        },
      ],
    });
    const resultHeading = await screen.findByRole('heading', {
      name: /here is how delirio can help you/i,
    });
    await waitFor(() => expect(resultHeading).toHaveFocus());
    const result = screen.getByRole('status');
    expect(result).toHaveTextContent(/here is how delirio can help you/i);
    expect(result).toHaveTextContent(/a plan built to handle schedule changes/i);
    expect(result).toHaveTextContent(/coaching that does not add another appointment/i);
    expect(within(result).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('heading', { name: /you.re one click away/i })).toBeInTheDocument();
    expect(result).toHaveTextContent(/tackle these challenges today with delirio/i);
    const download = screen.getByRole('link', { name: /download delirio now on the app store/i });
    expect(download).toHaveAttribute('href', 'https://apps.apple.com/');
    expect(download).toHaveAttribute('target', '_blank');
    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /answer again/i })).not.toBeInTheDocument();
  });

  it('closes with Escape and restores focus to the hero trigger', async () => {
    const user = userEvent.setup();
    render(<FeedbackHarness />);
    const launchButton = screen.getByRole('button', { name: /shape what’s next/i });

    await user.click(launchButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(launchButton).toHaveFocus());
  });

  it('closes from the X without navigating', async () => {
    const user = userEvent.setup();
    render(<FeedbackHarness />);
    await user.click(screen.getByRole('button', { name: /shape what’s next/i }));
    const historyBackSpy = jest.spyOn(window.history, 'back');
    const currentUrl = window.location.href;

    await user.click(screen.getByRole('button', { name: /close questionnaire/i }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(historyBackSpy).not.toHaveBeenCalled();
    expect(window.location.href).toBe(currentUrl);
    expect(window.history.state?.delirioQuestionnaire).toBeUndefined();
  });

  it('starts a fresh response whenever the questionnaire is opened again', async () => {
    const user = userEvent.setup();
    render(<FeedbackHarness />);
    const launchButton = screen.getByRole('button', { name: /shape what’s next/i });

    await user.click(launchButton);
    await user.click(screen.getByRole('button', { name: /take the 60-second quiz/i }));
    await user.click(screen.getByRole('radio', { name: 'No' }));
    expect(screen.getByRole('radio', { name: 'No' })).toBeChecked();
    await user.click(screen.getByRole('button', { name: /close questionnaire/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    await user.click(launchButton);
    expect(screen.getByRole('button', { name: /take the 60-second quiz/i })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /take the 60-second quiz/i }));
    expect(screen.getByLabelText('Question 1 of 5')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'No' })).not.toBeChecked();
  });

  it('advances when a previously selected answer is clicked again after going back', async () => {
    const user = await openQuestionnaire();

    await user.click(screen.getByRole('radio', { name: 'No' }));
    await screen.findByRole('heading', {
      name: /has a change in your body, energy, or schedule ever disrupted your training/i,
    });

    await user.click(screen.getByRole('button', { name: /back/i }));
    const previousAnswer = screen.getByRole('radio', { name: 'No' });
    expect(previousAnswer).toBeChecked();

    await user.click(previousAnswer);
    expect(
      await screen.findByRole('heading', {
        name: /has a change in your body, energy, or schedule ever disrupted your training/i,
      }),
    ).toBeInTheDocument();
  });
});
