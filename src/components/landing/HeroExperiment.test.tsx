import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroExperiment } from './HeroExperiment';
import { HeroWorkoutScoreboard } from './unused/HeroWorkoutScoreboard';

describe('HeroExperiment', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  it.each([
    ['', 'hero-v3-title', '#questionnaire'],
    ['?hero=v1', 'hero-title', '#coaches'],
    ['?hero=v2', 'hero-v23-title', '#coaches'],
    ['?hero=v2.3', 'hero-v23-title', '#coaches'],
    ['?hero=v3', 'hero-v3-title', '#questionnaire'],
  ])('renders the saved %s composition', (search, headingId, ctaHref) => {
    window.history.replaceState({}, '', `/${search}`);
    render(<HeroExperiment />);
    expect(screen.getByRole('heading')).toHaveAttribute('id', headingId);
    expect(screen.getByRole('link')).toHaveAttribute('href', ctaHref);
  });

  it.each(['?hero=v1', '?hero=v2.3'])(
    'makes the %s background video eligible for autoplay',
    (search) => {
      window.history.replaceState({}, '', `/${search}`);
      const { container } = render(<HeroExperiment />);
      const video = container.querySelector('video');
      expect(video).toBeInstanceOf(HTMLVideoElement);
      expect(video).toHaveProperty('autoplay', true);
      expect(video).toHaveProperty('muted', true);
      expect(video).toHaveProperty('loop', true);
      expect(video).toHaveProperty('playsInline', true);
      expect(video).toHaveAttribute('preload', 'auto');
    },
  );

  it('uses a static background image for the default Hero V3', () => {
    const { container } = render(<HeroExperiment />);
    expect(container.querySelector('.d3-hero-image')).toBeInstanceOf(HTMLImageElement);
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('renders the minimal tactical strip in Hero V2.3', () => {
    window.history.replaceState({}, '', '/?hero=v2.3');
    render(<HeroExperiment />);
    expect(screen.getByRole('complementary', { name: /live workout tactical strip/i })).toHaveTextContent(/form quality.*calories burned.*rest/i);
  });

  it('keeps the default Hero V3 focused and free of the workout scoreboard', () => {
    window.history.replaceState({}, '', '/?hero=v3');
    render(<HeroExperiment />);
    expect(screen.queryByRole('complementary', { name: /live workout scoreboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your energy shifts.*your coach adapts.*get fit.*stay fit.*keep going/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^YOU$/)).toHaveLength(1);
    expect(screen.getAllByText('TAKE A QUIZ')).toHaveLength(2);
    expect(screen.getByText('ADAPTIVE PLANS / LIVE GUIDANCE / CHECK-INS / CONTINUITY')).toBeInTheDocument();
    expect(screen.getByLabelText(/context updated.*next step ready/i)).toBeInTheDocument();
  });

  it('opens the research questionnaire from the default hero', async () => {
    const user = userEvent.setup();
    const onOpenQuestionnaire = jest.fn();
    render(<HeroExperiment onOpenQuestionnaire={onOpenQuestionnaire} />);

    await user.click(screen.getByRole('button', { name: /take a quiz/i }));
    expect(onOpenQuestionnaire).toHaveBeenCalledTimes(1);
  });

  it('preserves the unused workout scoreboard for future sections', () => {
    render(<HeroWorkoutScoreboard />);
    const scoreboard = screen.getByRole('complementary', { name: /live workout scoreboard/i });
    expect(scoreboard).toHaveTextContent(/set.*form.*calories.*rest/i);
    expect(screen.getByLabelText(/form quality 94 percent/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/calories burned 286 kilocalories/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/rest 42 seconds/i)).toBeInTheDocument();
  });
});
