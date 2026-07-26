import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlanToLiveGuidance } from './PlanToLiveGuidance';

describe('PlanToLiveGuidance', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps the vertical menu, capture, and content synchronized', async () => {
    const user = userEvent.setup();
    render(<PlanToLiveGuidance />);

    await user.click(screen.getByRole('button', { name: /03 see the rep coach the movement/i }));

    expect(screen.getByRole('heading', { name: 'SEE WHAT CHANGED. KNOW WHAT COMES NEXT.' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'SEE THE REP: LIVE REPS + REST' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /03 see the rep coach the movement/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByRole('tablist', { name: /product experience sequence/i })).not.toBeInTheDocument();
  });

  it('auto-advances every three seconds', () => {
    jest.useFakeTimers();
    render(<PlanToLiveGuidance />);

    expect(screen.getByRole('heading', { name: 'A PLAN FOR THE WEEK YOU HAVE.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(3000));
    expect(screen.getByRole('heading', { name: 'SEE WHAT’S AHEAD. START WHEN READY.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(6000));
    expect(screen.getByRole('heading', { name: 'THE WORKOUT ENDS. THE CONTEXT CONTINUES.' })).toBeInTheDocument();
  });

  it('resets the three-second interval after manual selection', async () => {
    jest.useFakeTimers();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<PlanToLiveGuidance />);

    act(() => jest.advanceTimersByTime(2000));
    await user.click(screen.getByRole('button', { name: /04 keep going carry it forward/i }));
    act(() => jest.advanceTimersByTime(2999));
    expect(screen.getByRole('heading', { name: 'THE WORKOUT ENDS. THE CONTEXT CONTINUES.' })).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1));
    expect(screen.getByRole('heading', { name: 'A PLAN FOR THE WEEK YOU HAVE.' })).toBeInTheDocument();
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
    expect(screen.getByRole('heading', { name: 'A PLAN FOR THE WEEK YOU HAVE.' })).toBeInTheDocument();
  });
});
