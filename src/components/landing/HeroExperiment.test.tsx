import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HeroExperiment } from './HeroExperiment';
import { HeroWorkoutScoreboard } from './unused/HeroWorkoutScoreboard';
import { recordQualifiedAction } from '../../services/conversionEvents';

jest.mock('../../services/conversionEvents', () => ({ recordQualifiedAction: jest.fn() }));

describe('HeroExperiment', () => {
  beforeEach(() => jest.mocked(recordQualifiedAction).mockClear());
  afterEach(() => window.history.replaceState({}, '', '/'));

  it.each([
    // No search and no `variant` prop is the shipped page: cell B, `HeroFocus`.
    ['', 'hero-focus-title'],
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

  it('uses a static background image for the default hero', () => {
    const { container } = render(<HeroExperiment />);
    expect(container.querySelector('.d3-hero-image')).toBeInstanceOf(HTMLImageElement);
    expect(container.querySelector('video')).not.toBeInTheDocument();
  });

  it('renders the minimal tactical strip in Hero V2.3', () => {
    window.history.replaceState({}, '', '/?hero=v2.3');
    render(<HeroExperiment />);
    expect(screen.getByRole('complementary', { name: /live workout tactical strip/i })).toHaveTextContent(/form quality.*calories burned.*rest/i);
  });

  it('keeps the pinned Hero V3 focused and free of the workout scoreboard', () => {
    window.history.replaceState({}, '', '/?hero=v3');
    render(<HeroExperiment />);
    expect(screen.queryByRole('complementary', { name: /live workout scoreboard/i })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /your energy shifts.*your coach adapts.*get fit.*stay fit.*keep going/i })).toBeInTheDocument();
    expect(screen.getAllByText(/^YOU$/)).toHaveLength(1);
    expect(screen.getByText('SEE HOW DELIRIO CAN HELP YOU')).toBeInTheDocument();
    expect(screen.getByText('ADAPTIVE PLANS / LIVE GUIDANCE / CHECK-INS / CONTINUITY')).toBeInTheDocument();
    expect(screen.getByLabelText(/context updated.*next step ready/i)).toBeInTheDocument();
  });

  it('sends the default hero to the App Store', async () => {
    const user = userEvent.setup();
    render(<HeroExperiment />);

    const cta = screen.getByRole('link', { name: 'DOWNLOAD THE APP' });
    expect(cta).toHaveAttribute('href', '/app');
    await user.click(cta);
    expect(recordQualifiedAction).toHaveBeenCalledWith('store_click');
  });

  it('offers nothing called a quiz anywhere', () => {
    for (const variant of ['a', 'b'] as const) {
      const { unmount } = render(<HeroExperiment variant={variant} />);
      expect(screen.queryByText(/quiz/i)).not.toBeInTheDocument();
      unmount();
    }
  });

  describe('acquisition experiment cells', () => {
    it('gives cell A the standard hero and one arrow-led download', async () => {
      const user = userEvent.setup();
      const { container } = render(<HeroExperiment variant="a" />);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hero-v3-title');
      expect(container.querySelector('.d3-hero-action')).toBeInTheDocument();
      expect(screen.queryByRole('button')).not.toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'DOWNLOAD THE APP' }));
      expect(recordQualifiedAction).toHaveBeenCalledWith('store_click');
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

    it('replaces the hero with the centred download layout in cell B', async () => {
      const user = userEvent.setup();
      const { container } = render(<HeroExperiment variant="b" />);
      expect(screen.getByRole('heading')).toHaveAttribute('id', 'hero-focus-title');
      expect(screen.getByRole('heading', { name: /get fit and stay fit without the planning/i })).toBeInTheDocument();
      expect(screen.getByText(/on iphone/i)).toBeInTheDocument();

      await user.click(screen.getByRole('link', { name: 'DOWNLOAD THE APP' }));
      expect(recordQualifiedAction).toHaveBeenCalledWith('store_click');
      expect(screen.getByText('ADAPTIVE PLANS / LIVE GUIDANCE / CHECK-INS / CONTINUITY')).toBeInTheDocument();
      // Copy and CTA only: a product screenshot would pull attention off the button.
      expect(container.querySelector('.d3-iphone-frame')).not.toBeInTheDocument();
    });

    /**
     * Every route to the store goes through `AppStoreLink`, which is what
     * attaches `data-cta` and the conversion. A hero CTA with the right href and
     * no `data-cta` would be a link that converts silently.
     */
    it('routes every cell to the branded interstitial, tracked', () => {
      for (const variant of ['a', 'b'] as const) {
        const { container, unmount } = render(<HeroExperiment variant={variant} />);
        const cta = container.querySelector('[href="/app"]');
        expect(cta).toHaveAttribute('data-cta', 'store');
        // Never the raw Apple URL: that lives only in public/app.html.
        expect(container.querySelector('[href*="apps.apple.com"]')).toBeNull();
        unmount();
      }
    });

    it('keeps every cell down to a single call to action', () => {
      for (const variant of ['a', 'b'] as const) {
        const { unmount } = render(<HeroExperiment variant={variant} />);
        // Every hero CTA is a link: it hands off to the App Store.
        expect(screen.getAllByRole('link')).toHaveLength(1);
        expect(screen.queryByRole('button')).not.toBeInTheDocument();
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
