import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroExperiment } from './HeroExperiment';
import { HeroWorkoutScoreboard } from './unused/HeroWorkoutScoreboard';

describe('HeroExperiment', () => {
  afterEach(() => window.history.replaceState({}, '', '/'));

  it.each([
    ['', 'hero-v3-title'],
    ['?hero=v1', 'hero-title'],
    ['?hero=v2', 'hero-v23-title'],
    ['?hero=v2.3', 'hero-v23-title'],
    ['?hero=v3', 'hero-v3-title'],
  ])('renders the saved %s composition', (search, headingId) => {
    window.history.replaceState({}, '', `/${search}`);
    render(<HeroExperiment />);
    expect(screen.getByRole('heading')).toHaveAttribute('id', headingId);
  });

  it.each(['?hero=v1', '?hero=v2', '?hero=v2.3'])('points the %s call to action at the coaches', (search) => {
    window.history.replaceState({}, '', `/${search}`);
    render(<HeroExperiment />);
    expect(screen.getByRole('link')).toHaveAttribute('href', '#coaches');
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
    expect(screen.getByText('SEE HOW DELIRIO CAN HELP YOU')).toBeInTheDocument();
    expect(screen.getByText('ADAPTIVE PLANS / LIVE GUIDANCE / CHECK-INS / CONTINUITY')).toBeInTheDocument();
    expect(screen.getByLabelText(/context updated.*next step ready/i)).toBeInTheDocument();
  });

  it('opens the waitlist gate from the default hero', async () => {
    const user = userEvent.setup();
    const onJoinWaitlist = jest.fn();
    render(<HeroExperiment onJoinWaitlist={onJoinWaitlist} />);

    await user.click(screen.getByRole('button', { name: 'JOIN THE WAITLIST' }));
    expect(onJoinWaitlist).toHaveBeenCalledTimes(1);
  });

  it('offers nothing called a quiz anywhere', () => {
    for (const variant of ['a', 'b'] as const) {
      const { unmount } = render(<HeroExperiment variant={variant} />);
      expect(screen.queryByText(/quiz/i)).not.toBeInTheDocument();
      unmount();
    }
  });

  describe('acquisition experiment cells', () => {
    it('gives cell A the standard hero and one arrow-led button', async () => {
      const user = userEvent.setup();
      const onJoinWaitlist = jest.fn();
      const { container } = render(<HeroExperiment variant="a" onJoinWaitlist={onJoinWaitlist} />);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hero-v3-title');
      expect(container.querySelector('.d3-hero-action')).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'JOIN THE WAITLIST' }));
      expect(onJoinWaitlist).toHaveBeenCalledTimes(1);
    });

    /**
     * The retired third cell drew this same button label-first. Nothing renders
     * that treatment now, and the markup it needed went with it — so this is the
     * guard against it creeping back in through a stray `cta` prop.
     */
    it('has no label-first button treatment left to render', () => {
      for (const variant of ['a', 'b'] as const) {
        const { container, unmount } = render(<HeroExperiment variant={variant} />);
        expect(container.querySelector('.d3-hero-questionnaire-action')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('replaces the hero with the centred waitlist layout in cell B', async () => {
      const user = userEvent.setup();
      const onJoinWaitlist = jest.fn();
      const { container } = render(<HeroExperiment variant="b" onJoinWaitlist={onJoinWaitlist} />);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hero-focus-title');
      expect(screen.getByRole('heading', { name: /get fit and stay fit without the planning/i })).toBeInTheDocument();
      expect(screen.getByText(/free to join/i)).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'JOIN THE WAITLIST' }));
      expect(onJoinWaitlist).toHaveBeenCalledTimes(1);
      expect(screen.getByText('ADAPTIVE PLANS / LIVE GUIDANCE / CHECK-INS / CONTINUITY')).toBeInTheDocument();
      // Copy and CTA only: a product screenshot would pull attention off the button.
      expect(container.querySelector('.d3-iphone-frame')).not.toBeInTheDocument();
    });

    it('leaves no route to the App Store in any cell', () => {
      for (const variant of ['a', 'b'] as const) {
        const { container, unmount } = render(<HeroExperiment variant={variant} />);
        expect(container.querySelector('[href*="apps.apple.com"], [href="/app"]')).toBeNull();
        expect(container.querySelector('[data-cta]')).toBeNull();
        unmount();
      }
    });

    it('keeps every cell down to a single call to action', () => {
      for (const variant of ['a', 'b'] as const) {
        const { unmount } = render(<HeroExperiment variant={variant} />);
        // Every hero CTA is a button: it opens the gate rather than navigating.
        expect(screen.getAllByRole('button')).toHaveLength(1);
        expect(screen.queryByRole('link')).not.toBeInTheDocument();
        unmount();
      }
    });

    it('lets a reviewer pin a saved composition over the assigned cell', () => {
      window.history.replaceState({}, '', '/?hero=v1');
      render(<HeroExperiment variant="b" />);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hero-title');
    });
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
