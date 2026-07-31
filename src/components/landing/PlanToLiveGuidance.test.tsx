import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanToLiveGuidance } from './PlanToLiveGuidance';

describe('PlanToLiveGuidance', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with the live coach trial, preserves the requested chapter order, and exposes a light theme', () => {
    const { container } = render(<PlanToLiveGuidance />);
    const section = container.querySelector<HTMLElement>('.d3-plan-live');
    const menu = screen.getByLabelText('Product journey chapters');
    const chapterButtons = within(menu).getAllByRole('button');

    expect(section).toHaveAttribute('data-theme', 'light');
    expect(chapterButtons).toHaveLength(5);
    expect(chapterButtons[0]).toHaveAccessibleName(/meet your coach try live voice/i);
    expect(chapterButtons[1]).toHaveAccessibleName(/plan coach builds the week/i);
    expect(chapterButtons[2]).toHaveAccessibleName(/start enter the workout/i);
    expect(chapterButtons[3]).toHaveAccessibleName(/see the rep coach the movement/i);
    expect(chapterButtons[4]).toHaveAccessibleName(/pick it up return with context/i);
    expect(screen.getByRole('heading', { name: 'AI COACHES THAT LISTEN, RESPOND, AND REMEMBER.' })).toBeInTheDocument();
  });

  it('keeps the vertical menu, capture, and content synchronized', async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanToLiveGuidance />);

    await user.click(screen.getByRole('button', { name: /see the rep coach the movement/i }));

    expect(screen.getByRole('heading', { name: 'SEE WHAT THE COACH NOTICED.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /man performing a controlled goblet squat/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /see the rep: live reps \+ rest app screen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /see the rep coach the movement/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('tablist', { name: /product experience sequence/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/see how delirio removes decisions/i)).not.toBeInTheDocument();
    expect(container.querySelector('.d3-plan-live-rule')).not.toBeInTheDocument();
  });

  it('auto-advances after a readable six-second chapter interval', () => {
    jest.useFakeTimers();
    render(<PlanToLiveGuidance />);

    expect(screen.getByRole('heading', { name: 'AI COACHES THAT LISTEN, RESPOND, AND REMEMBER.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(6000));
    expect(screen.getByRole('heading', { name: 'A PLAN BUILT FOR THE WEEK YOU HAVE.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(12000));
    expect(screen.getByRole('heading', { name: 'SEE WHAT THE COACH NOTICED.' })).toBeInTheDocument();
  });

  it('includes missed-workout continuity as the fifth carousel stage', async () => {
    const user = userEvent.setup();
    render(<PlanToLiveGuidance />);

    await user.click(screen.getByRole('button', { name: /pick it up return with context/i }));

    expect(screen.getByRole('heading', { name: 'A MISSED WORKOUT. NOT AN ABANDONED PLAN.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /imessage conversation with iris/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /delirio in-app conversation with iris/i })).toBeInTheDocument();
    expect(screen.getByText('You can now message your coach in Delirio or iMessage')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /pick it up return with context/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /plan coach builds the week/i })).toHaveClass('is-complete');
    expect(screen.getByRole('button', { name: /meet your coach try live voice/i })).toHaveClass('is-complete');
  });

  it('resets the six-second progress interval after manual selection', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PlanToLiveGuidance />);

    act(() => jest.advanceTimersByTime(4000));
    await user.click(screen.getByRole('button', { name: /meet your coach try live voice/i }));
    act(() => jest.advanceTimersByTime(5999));
    expect(screen.getByRole('heading', { name: 'AI COACHES THAT LISTEN, RESPOND, AND REMEMBER.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole('heading', { name: 'A PLAN BUILT FOR THE WEEK YOU HAVE.' })).toBeInTheDocument();
  });

  it('restarts the active rail animation without replacing the focused chapter button', async () => {
    const user = userEvent.setup();
    render(<PlanToLiveGuidance />);
    const plan = screen.getByRole('button', { name: /plan coach builds the week/i });
    const firstCycle = plan.getAttribute('data-progress-cycle');

    await user.click(plan);

    expect(plan).toHaveFocus();
    expect(plan).toHaveAttribute('aria-current', 'step');
    expect(plan.getAttribute('data-progress-cycle')).not.toBe(firstCycle);
  });

  it('uses the consolidated photo-led design while preserving the final phone screenshot', async () => {
    const user = userEvent.setup();
    const { container } = render(<PlanToLiveGuidance />);
    const section = container.querySelector<HTMLElement>('.d3-plan-live');

    expect(section).not.toHaveAttribute('data-design-version');
    expect(container.querySelector('.d3-plan-live-backdrop')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /start enter the workout/i }));
    expect(screen.getByRole('img', { name: /woman starting a strength workout at home/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /start: exercises \+ session start app screen/i }).closest('.d3-iphone-frame')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /see the rep coach the movement/i }));
    expect(screen.getByRole('img', { name: /man performing a controlled goblet squat/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /see the rep: live reps \+ rest app screen/i }).closest('.d3-iphone-frame')).not.toBeNull();

    await user.click(screen.getByRole('button', { name: /meet your coach try live voice/i }));
    expect(screen.getByRole('img', { name: /woman texting her delirio coach/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /man texting his delirio coach/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /iris, a delirio ai coach/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /reed, a delirio ai coach/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /delirio coaching guidance during a workout/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /delirio coaching guidance during a workout/i }).closest('.d3-iphone-frame')).not.toBeNull();
    expect(screen.getAllByLabelText(/example conversation with iris/i)).toHaveLength(2);
    expect(screen.getByText(/my energy is lower today/i)).toBeInTheDocument();
    expect(screen.getByText(/can we keep this under 30 minutes/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /pick it up return with context/i }));
    expect(screen.getAllByRole('img', { name: /conversation with iris/i })).toHaveLength(2);
  });

  it('does not start automatic progression when reduced motion is requested', () => {
    jest.useFakeTimers();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: jest.fn(() => ({
        matches: true,
        media: '(prefers-reduced-motion: reduce)',
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<PlanToLiveGuidance />);
    act(() => jest.advanceTimersByTime(9000));
    expect(screen.getByRole('heading', { name: 'AI COACHES THAT LISTEN, RESPOND, AND REMEMBER.' })).toBeInTheDocument();
  });

  it('starts the voice experience from the coach trial chapter', async () => {
    const user = userEvent.setup();
    const onStartVoice = jest.fn();
    render(<PlanToLiveGuidance onStartVoice={onStartVoice} />);

    const link = screen.getByRole('link', { name: /start voice session/i });
    expect(link).toHaveAttribute('href', '#coaches');
    expect(screen.getByText(/choose iris or reed and talk naturally/i)).toBeInTheDocument();

    await user.click(link);
    expect(onStartVoice).toHaveBeenCalledTimes(1);
  });

  it('offers the questionnaire from the plan chapter', async () => {
    const user = userEvent.setup();
    const onTakeQuiz = jest.fn();
    render(<PlanToLiveGuidance onTakeQuiz={onTakeQuiz} />);

    await user.click(screen.getByRole('button', { name: /plan coach builds the week/i }));

    expect(screen.getByText('See how Delirio can help you.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'TAKE QUIZ' }));
    expect(onTakeQuiz).toHaveBeenCalledTimes(1);
  });
});
