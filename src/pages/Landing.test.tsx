import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { WAITLIST_QUESTIONS } from '../content/waitlistQuestions';
import Landing from './Landing';

/** Derived, so rewriting the questions does not break unrelated assertions. */
const introCopy = new RegExp(`${WAITLIST_QUESTIONS.length} questions, then your spot`, 'i');

describe('Landing journey', () => {
  afterEach(() => jest.useRealTimers());

  it('introduces both coaches without asking the visitor to pick one', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    const coaches = screen.getByRole('region', { name: /meet iris and reed/i });
    expect(within(coaches).getByRole('img', { name: /iris, a delirio ai coach/i })).toBeInTheDocument();
    expect(within(coaches).getByRole('img', { name: /reed, a delirio ai coach/i })).toBeInTheDocument();
    expect(within(coaches).getByText(/warm, patient, and understanding/i)).toBeInTheDocument();
    expect(within(coaches).getByText(/structured, direct, and schedule-driven/i)).toBeInTheDocument();

    // Nothing in the section is pressable — it introduces, it does not connect.
    expect(within(coaches).queryAllByRole('button')).toHaveLength(0);
    expect(within(coaches).queryAllByRole('link')).toHaveLength(0);
  });

  it('offers no route to the App Store anywhere on the page', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    // Ads point here while the app update is in review, so a download link
    // would both leak traffic to the store and undercut the waitlist premise.
    expect(document.querySelector('[href*="apps.apple.com"]')).toBeNull();
    expect(document.querySelector('[href="/app"]')).toBeNull();
    expect(document.querySelector('[data-cta]')).toBeNull();
    expect(screen.queryByText(/download on the app store/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /1 week free/i })).not.toBeInTheDocument();
  });

  it('keeps both plan cards intact but sells neither', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    const plans = document.querySelectorAll('.d3-plan');
    expect(plans).toHaveLength(2);
    for (const plan of plans) {
      expect(within(plan as HTMLElement).getByRole('heading')).toBeInTheDocument();
      expect(within(plan as HTMLElement).getAllByRole('listitem').length).toBeGreaterThan(0);
      expect(within(plan as HTMLElement).queryByRole('link')).not.toBeInTheDocument();
    }
  });

  it('asks for no email anywhere on the page itself', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    // The only email box lives behind the gate, after the questions. A second
    // one out here would let a visitor skip the filter the gate exists for.
    expect(document.querySelectorAll('.d3-wishlist')).toHaveLength(0);
    expect(screen.queryByRole('textbox', { name: /email address/i })).not.toBeInTheDocument();
  });

  it('opens the gate for an off-page waitlist link instead of hunting for a section', async () => {
    window.history.replaceState({}, '', '/#wishlist');
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    // Straight to question one: following that link was already the decision.
    expect(screen.getByRole('heading', { name: WAITLIST_QUESTIONS[0].prompt })).toBeInTheDocument();
    // Cleared, so a reload does not reopen it.
    await waitFor(() => expect(window.location.hash).toBe(''));
  });

  it('leaves no way to start a coaching session from the website', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.queryByRole('heading', { name: /choose how you.*want to be coached/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /select coach/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'TEXT' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'VOICE' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /start voice session/i })).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/type a message/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('shows three closed FAQs initially and reveals up to three more on each request', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    const faqList = document.querySelector('.d3-faq-list');
    expect(faqList).not.toBeNull();
    expect(screen.getByRole('button', { name: /is this actually ai or a set of canned responses/i })).toHaveAttribute('aria-expanded', 'false');
    expect(within(faqList as HTMLElement).getAllByRole('button', { expanded: false })).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /how does voice coaching work/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^more\.\.\.$/i }));
    expect(screen.getByRole('button', { name: /how does voice coaching work/i })).toHaveAttribute('aria-expanded', 'false');

    await user.click(screen.getByRole('button', { name: 'About the coaching' }));
    expect(within(faqList as HTMLElement).getAllByRole('button', { expanded: false })).toHaveLength(3);
    await user.click(screen.getByRole('button', { name: /^more\.\.\.$/i }));
    expect(within(faqList as HTMLElement).getAllByRole('button', { expanded: false })).toHaveLength(6);
    expect(screen.queryByRole('button', { name: /will my coach push me too hard/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /^more\.\.\.$/i }));
    expect(within(faqList as HTMLElement).getAllByRole('button', { expanded: false })).toHaveLength(9);
    expect(screen.queryByRole('button', { name: /^more\.\.\.$/i })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'About the price' }));
    expect(screen.getByRole('button', { name: /why pay \$30\/month/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByRole('button', { name: /can i cancel anytime/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: /more/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /can the ai actually see my form/i })).not.toBeInTheDocument();
  });

  it('presents problem recognition before the product mechanism and keeps medical claims bounded', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.queryByRole('heading', { name: /less starting over.*more knowing what.s next/i })).not.toBeInTheDocument();
    expect(screen.getByRole('region', { name: /delirio coaching experience/i })).toBeInTheDocument();
    const problemBand = screen.getByRole('region', { name: /when staying fit feels harder/i });
    const painPoints = within(problemBand).getAllByRole('article');
    expect(painPoints).toHaveLength(4);
    expect(painPoints.every((painPoint) => painPoint.querySelector('svg[aria-hidden="true"]'))).toBe(true);
    expect(problemBand).toHaveTextContent(/energy and strength changes.*adjusts the plan/i);
    expect(problemBand).toHaveTextContent(/motivation drops.*motivational reminders.*purpose/i);
    expect(problemBand).toHaveTextContent(/time gets squeezed.*rebuilds the session/i);
    expect(problemBand).toHaveTextContent(/regaining feels overwhelming.*progressive path.*rebuild strength/i);
    expect(problemBand).not.toHaveTextContent(/glp-1 journeys|busy weeks|missed days|the friction delirio removes/i);
    expect(screen.queryByText(/physical wellbeing concerns/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /pick it up return with context/i }));
    expect(screen.getByRole('heading', { name: /a missed workout.*not an abandoned plan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /one coach.*no appointment to reschedule/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'About the product' }));
    for (let batch = 0; batch < 4; batch += 1) {
      await user.click(screen.getByRole('button', { name: /^more\.\.\.$/i }));
    }
    expect(screen.getByRole('button', { name: /strength training while i use a glp-1 medication/i })).toBeInTheDocument();
  });

  it('keeps retired landing-page content out of the rendered journey', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.queryByText(/ask in the moment/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/hear what changes/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /clear about what is known/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /start the questions/i })).not.toBeInTheDocument();
    expect(document.querySelector('.d3-voice-product')).not.toBeInTheDocument();
  });

  it('offers a direct pricing contact option', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    // Scoped to the pricing block: the footer carries a second link to the same
    // address for waitlist opt-out, so a page-wide query matches both.
    const pricingContact = document.querySelector('.d3-pricing-contact a');
    expect(pricingContact).toHaveAttribute('href', 'mailto:contact@delirio.fit');
    expect(pricingContact).toHaveTextContent('contact@delirio.fit');
  });

  it('links How it works directly to the product journey carousel', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);

    expect(screen.getByRole('link', { name: /how it works/i })).toHaveAttribute('href', '#how-it-works');
    const problemBand = document.querySelector('.d3-problem-band');
    const carousel = document.getElementById('how-it-works');
    const coachStudio = document.getElementById('coaches-section');
    expect(carousel).toHaveClass('d3-plan-live');
    expect(carousel).toHaveAttribute('data-theme', 'light');
    expect(Boolean((problemBand?.compareDocumentPosition(carousel as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean((carousel?.compareDocumentPosition(coachStudio as Node) ?? 0) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(document.querySelector('.d3-wheel-transition')).not.toBeInTheDocument();
  });

  it('opens the first waitlist question from the default hero', async () => {
    const user = userEvent.setup();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    await user.click(within(document.querySelector('.d3-hero') as HTMLElement)
      .getByRole('button', { name: 'JOIN THE WAITLIST' }));
    expect(screen.getByRole('heading', { name: WAITLIST_QUESTIONS[0].prompt })).toBeInTheDocument();
    // A CTA press skips the intro: the visitor already chose to be here.
    expect(screen.queryByRole('button', { name: /start — takes a minute/i })).not.toBeInTheDocument();
  });

  it('offers nothing called a quiz', () => {
    render(<MemoryRouter><Landing /></MemoryRouter>);
    expect(screen.queryByText(/quiz/i)).not.toBeInTheDocument();
  });

  it('opens the waitlist invitation after thirty seconds', async () => {
    jest.useFakeTimers();
    render(<MemoryRouter><Landing /></MemoryRouter>);

    act(() => jest.advanceTimersByTime(29000));
    expect(screen.queryByText(introCopy)).not.toBeInTheDocument();

    act(() => jest.advanceTimersByTime(1000));
    expect(await screen.findByText(introCopy)).toBeInTheDocument();
    jest.useRealTimers();
  });

  describe('acquisition experiment cells', () => {
    beforeEach(() => window.sessionStorage.clear());
    afterEach(() => window.history.replaceState({}, '', '/'));

    it('leaves the hero to make the ask on its own at the top of the page', () => {
      render(<MemoryRouter><Landing /></MemoryRouter>);

      const header = within(document.querySelector('.d3-header') as HTMLElement);
      expect(header.queryByRole('button', { name: /waitlist/i })).not.toBeInTheDocument();
      expect(within(document.querySelector('.d3-hero') as HTMLElement)
        .getByRole('button', { name: 'JOIN THE WAITLIST' })).toBeInTheDocument();
      expect(document.querySelector('.d3-page')).toHaveAttribute('data-landing-variant', 'a');
    });

    it('keeps the hidden header button off the keyboard too', () => {
      render(<MemoryRouter><Landing /></MemoryRouter>);

      // It stays mounted so the row does not reflow, so the hiding cannot be
      // left to a stylesheet.
      const cta = document.querySelector('.d3-header-cta') as HTMLElement;
      expect(cta).toHaveClass('is-hidden');
      expect(cta).toHaveAttribute('aria-hidden', 'true');
      expect(cta).toHaveAttribute('tabindex', '-1');
    });

    it('renders the centred waitlist hero in cell B without touching the page below', () => {
      window.history.replaceState({}, '', '/?v=b');
      render(<MemoryRouter><Landing /></MemoryRouter>);

      expect(document.querySelector('.d3-page')).toHaveAttribute('data-landing-variant', 'b');
      expect(screen.getByRole('heading', { name: /get fit and stay fit without the planning/i })).toBeInTheDocument();
      expect(document.getElementById('how-it-works')).toBeInTheDocument();
      expect(document.getElementById('pricing')).toBeInTheDocument();
      expect(document.getElementById('faq')).toBeInTheDocument();
    });

    it('never covers cell B with the gate on a timer', () => {
      jest.useFakeTimers();
      window.history.replaceState({}, '', '/?v=b');
      render(<MemoryRouter><Landing /></MemoryRouter>);

      act(() => jest.advanceTimersByTime(120000));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      jest.useRealTimers();
    });

    it.each(['a', 'b'] as const)(
      'hands cell %s over to the header once the hero CTA scrolls away',
      async (variant) => {
        window.history.replaceState({}, '', `/?v=${variant}`);
        render(<MemoryRouter><Landing /></MemoryRouter>);

        // Scoped to the header: every hero carries its own waitlist button, so
        // an unscoped query would pass before the handover ever happens.
        const header = () => within(document.querySelector('.d3-header') as HTMLElement);
        expect(header().queryByRole('button', { name: /waitlist/i })).not.toBeInTheDocument();

        Object.defineProperty(window, 'scrollY', { configurable: true, value: window.innerHeight });
        window.dispatchEvent(new Event('scroll'));

        await waitFor(() => expect(header().getByRole('button', { name: 'JOIN THE WAITLIST' })).toBeInTheDocument());

        Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
      },
    );

    it('opens the gate from the header once it has taken over', async () => {
      const user = userEvent.setup();
      render(<MemoryRouter><Landing /></MemoryRouter>);

      Object.defineProperty(window, 'scrollY', { configurable: true, value: window.innerHeight });
      window.dispatchEvent(new Event('scroll'));

      const header = () => within(document.querySelector('.d3-header') as HTMLElement);
      await user.click(await waitFor(() => header().getByRole('button', { name: 'JOIN THE WAITLIST' })));
      expect(screen.getByRole('heading', { name: WAITLIST_QUESTIONS[0].prompt })).toBeInTheDocument();

      Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 });
    });

    it('publishes the assigned cell for ad tracking', () => {
      window.history.replaceState({}, '', '/?v=b');
      render(<MemoryRouter><Landing /></MemoryRouter>);
      expect(window.delirioLandingVariant).toBe('b');
    });

    /** A live ad may still carry the retired letter; it must land somewhere sane. */
    it('sends a stale ?v=c ad URL to the control cell', () => {
      window.history.replaceState({}, '', '/?v=c');
      render(<MemoryRouter><Landing /></MemoryRouter>);
      expect(document.querySelector('.d3-page')).toHaveAttribute('data-landing-variant', 'a');
    });
  });
});
