import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { submitFeedbackToFirestore } from '../../services/feedbackSubmission';
import { FeedbackSection } from './FeedbackSection';

jest.mock('../../services/feedbackSubmission', () => ({
  submitFeedbackToFirestore: jest.fn(),
}));

const submitFeedbackMock = jest.mocked(submitFeedbackToFirestore);

describe('FeedbackSection', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    submitFeedbackMock.mockReset();
    window.localStorage.clear();
  });

  it('renders the first product question immediately', () => {
    render(<FeedbackSection />);

    expect(screen.getByRole('radio', { name: 'A plan that adjusts around my schedule' })).toBeInTheDocument();
    expect(screen.getByLabelText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.queryByLabelText(/email|phone/i)).not.toBeInTheDocument();
  });

  it('auto-advances after one answer and provides Back in the card header', async () => {
    const user = userEvent.setup();
    render(<FeedbackSection />);

    await user.click(screen.getByRole('radio', { name: 'A plan that adjusts around my schedule' }));
    expect(screen.getByRole('radio', { name: 'A plan that adjusts around my schedule' })).toBeChecked();
    expect(screen.queryByRole('radio', { name: 'Clearer movement explanations' })).not.toBeInTheDocument();
    expect(await screen.findByRole('radio', { name: 'Clearer movement explanations' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByRole('radio', { name: 'A plan that adjusts around my schedule' })).toBeChecked();
  });

  it('posts valid feedback and reports persistence success', async () => {
    const user = userEvent.setup();
    submitFeedbackMock.mockResolvedValue('firestore-document-id');
    window.localStorage.setItem('delirio_feedback_browser_id', 'browser_id_1234567890');
    render(<FeedbackSection />);

    for (const [answer, groupName] of [
      ['A plan that adjusts around my schedule', 'wish'],
      ['Clearer movement explanations', 'coachingUsefulness'],
      ['More flexible weekly plans', 'nextBuild'],
    ] as const) {
      const selectedOption = await screen.findByRole('radio', { name: answer });
      const questionOptions = screen.getAllByRole('radio');
      expect(questionOptions).toHaveLength(4);
      expect(questionOptions.every((option) => option.getAttribute('name') === groupName)).toBe(true);

      await user.click(selectedOption);
      expect(screen.getAllByRole('radio').filter((option) => (option as HTMLInputElement).checked)).toHaveLength(1);
    }

    await waitFor(() => expect(submitFeedbackMock).toHaveBeenCalledTimes(1));
    expect(submitFeedbackMock).toHaveBeenCalledWith('browser_id_1234567890', {
      wish: 'A plan that adjusts around my schedule',
      coachingUsefulness: 'Clearer movement explanations',
      nextBuild: 'More flexible weekly plans',
    });
    expect(await screen.findByRole('status')).toHaveTextContent(/thank you/i);
  });
});
