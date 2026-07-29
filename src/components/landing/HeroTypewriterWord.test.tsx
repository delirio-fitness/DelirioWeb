import { act, render } from '@testing-library/react';
import { HeroTypewriterWord } from './HeroTypewriterWord';

describe('HeroTypewriterWord', () => {
  const words = ['TRAINING.', 'PLAN.', 'WORKOUT.'];
  const defaultMatchMedia = window.matchMedia;

  beforeEach(() => jest.useFakeTimers());
  afterEach(() => {
    jest.useRealTimers();
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: defaultMatchMedia });
  });

  it('deletes the current term and types the next audience-language term', () => {
    const { container } = render(<HeroTypewriterWord words={words} />);
    const word = container.querySelector('.d3-hero-typewriter');
    expect(word).toHaveTextContent('TRAINING.');

    act(() => jest.advanceTimersByTime(1700));
    for (let character = 0; character < 'TRAINING.'.length; character += 1) {
      act(() => jest.advanceTimersByTime(55));
    }
    expect(word).toBeEmptyDOMElement();

    act(() => jest.advanceTimersByTime(260));
    act(() => jest.advanceTimersByTime(90));
    expect(word).toHaveTextContent('P');
  });

  it('keeps the stable headline term when reduced motion is preferred', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => ({ matches: true }) as MediaQueryList,
    });
    const { container } = render(<HeroTypewriterWord words={words} />);
    act(() => jest.advanceTimersByTime(10_000));
    expect(container.querySelector('.d3-hero-typewriter')).toHaveTextContent('TRAINING.');
  });
});
