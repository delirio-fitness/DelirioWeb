import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ChevronDown, ChevronRight, Flame, Headset, Menu, Timer, TrendingUp, X } from 'lucide-react';
import { APP_STORE_URL, MONTHLY_PRICE_USD, YEARLY_MONTHLY_EQUIVALENT_USD, YEARLY_PRICE_USD } from '../config/product';
import { ConfirmDialog } from '../components/landing/ConfirmDialog';
import { FeedbackSection } from '../components/landing/FeedbackSection';
import { HeroExperiment } from '../components/landing/HeroExperiment';
import { LandingFooter } from '../components/landing/LandingFooter';
import { ProductMomentsSection } from '../components/landing/ProductMomentsSection';
import { SessionStudio, type SessionMode } from '../components/landing/SessionStudio';
import { Logo } from '../components/logo';
import { coachProfiles, type CoachId } from '../content/landingContent';
import { useTextChat } from '../hooks/useTextChat';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { generateDiscoveryId } from '../utils/pipecatConfig';
import { TopAnnouncementStrip } from '../components/landing/TopAnnouncementStrip';

const frictionMoments = [
  {
    icon: Activity,
    title: 'ENERGY AND STRENGTH CHANGES.',
    copy: 'Delirio adjusts the plan to what you can do today.',
  },
  {
    icon: Flame,
    title: 'MOTIVATION DROPS.',
    copy: 'Your coach sends motivational reminders that reconnect you with your purpose and help you keep going.',
  },
  {
    icon: Timer,
    title: 'TIME GETS SQUEEZED.',
    copy: 'Delirio rebuilds the session around the time you have.',
  },
  {
    icon: TrendingUp,
    title: 'REGAINING FEELS OVERWHELMING.',
    copy: 'Your coach gives you a clear, progressive path to rebuild strength and keeps you moving forward.',
  },
] as const;

const benefits = [
  'Adaptive plans that change with your training',
  'Real-time workout guidance',
  'Camera-based form feedback for supported movements',
  'Your coach by voice or text',
];

type FaqCategory = 'AI' | 'COACHING' | 'PRODUCT' | 'PRICE';

const faqCategoryLabels: Record<FaqCategory, string> = {
  AI: 'About the AI',
  COACHING: 'About the coaching',
  PRODUCT: 'About the product',
  PRICE: 'About the price',
};

const faqCategories: FaqCategory[] = ['AI', 'COACHING', 'PRODUCT', 'PRICE'];
const INITIAL_FAQ_COUNT = 3;
const FAQ_BATCH_SIZE = 3;

const faqSections: Record<FaqCategory, readonly (readonly [string, string])[]> = {
  AI: [
    ['Is this actually AI or a set of canned responses?', 'Delirio uses live AI to respond to your conversation and the workout context available to it. Responses are not selected from a fixed script, but AI can still misunderstand or make mistakes. You remain in control of important training decisions.'],
    ['What can Delirio assess through the camera?', 'With the camera on, Delirio uses pose estimation to assess supported movements and visible movement details. Camera angle, lighting, clothing, and whether your full body is visible can limit what it can assess. It provides fitness guidance, not injury assessment or medical diagnosis.'],
    ['What if talking to an AI coach feels unfamiliar?', 'Start with whichever format feels more comfortable: text or voice. You can switch modes, pause a conversation, or train without the camera. There is no requirement to use every coaching feature.'],
    ['How does voice coaching work?', 'Voice mode supports live back-and-forth during a session, using the conversation and available workout context. You can end the session at any time, and microphone access is requested only when you start voice mode.'],
  ],
  COACHING: [
    ["What's the difference between Reed and Iris?", 'Reed is focused and structured. Iris is attentive and encouraging. Choose the style that helps you feel clear and supported; you can switch coaches later. Both use the training context available in Delirio.'],
    ['Does Delirio replace a personal trainer?', 'Delirio can create and adapt your plan, guide workouts, support reflection, and follow up. It is not a certified personal trainer or medical professional, cannot physically spot you, and does not diagnose pain or injury. You can also use it alongside a human trainer.'],
    ['What happens between workouts?', 'If you opt in, your coach can send reminders, check-ins, and follow-ups through your selected messaging channel. The goal is to make returning clearer—not to judge a missed day. You control those preferences and can pause messages at any time.'],
    ['How is this different from a typical fitness app?', 'Most fitness apps provide plans, videos, and timers as separate tools. Delirio connects the plan, the session, what happened, and what should change next so you have a clearer way to continue.'],
    ['How is this different from online coaching?', 'Delirio provides automated guidance and conversation when you choose to use it, rather than relying on a scheduled human check-in. A human coach can offer judgment, physical assistance, and expertise that AI cannot, so the right choice depends on the support you need.'],
    ['Do I need to work out every day for this to be worth it?', 'No. Whether you train five days a week or two, Delirio can use your pattern to adjust the plan and make the next session clear without treating a missed day like a failure.'],
    ['Will my coach push me too hard?', 'You stay in control. Pause, stop, take more rest, or ask your coach to adjust the plan when you need to. Delirio can recommend a progression, but you decide whether it fits how you feel today.'],
    ['Can my coach change my program mid-week if something comes up?', 'Yes. Tell your coach when your schedule, available equipment, or energy changes. Delirio can build a shorter session, choose a substitution, or prepare an updated week for you to review.'],
    ['Can I talk to my coach about things outside of workouts?', 'You can share life context that affects training, such as travel, stress, or limited time. Delirio uses that context for fitness guidance; it does not provide therapy or medical advice.'],
  ],
  PRODUCT: [
    ['Can I text my coach or do I have to use the app?', 'You can keep the complete coaching conversation in Delirio and, when available and enabled, opt in to brief SMS reminders or follow-ups. You control the channel and can pause messages at any time.'],
    ['Does this work at a gym or only at home?', 'Both. You need your phone camera visible while you train, and space to move. That works in a living room, a garage, a park, or a gym floor.'],
    ['Do I need special equipment?', 'No. You need your phone and enough space to move. Your coach programs around whatever you have access to - bodyweight at home, a full gym, a hotel room with nothing.'],
    ['Do I have to use the camera every time?', 'No. The camera provides additional movement context when you choose to use it. You can still follow your plan and use text or voice without camera access.'],
    ['What kind of workouts can I do?', 'Strength training is the core focus. Your coach can structure a split, recommend progression, and use camera context to assess supported movement details. Activities like walks, runs, and mobility work can fit alongside your strength plan.'],
    ['How long are the workouts?', "That depends on you. Your coach builds around the time you have. If you've got 30 minutes, you get a 30-minute session. If you've got an hour, you get an hour. No filler."],
    ['What if I already have a workout plan?', 'Your coach can work with it or build a new one for you. The value extends beyond the plan: clearer session guidance, useful reflection, and follow-through when your week changes.'],
    ["What if I'm a complete beginner?", 'You do not need to arrive knowing every exercise. Delirio can build a starting plan, explain movements, and offer guidance on the movement details it can assess. Start with manageable sessions and ask whenever something is unclear.'],
    ["What if I already know what I'm doing?", 'Experienced users can have Delirio handle programming context, rep and rest support, session reflection, and plan adjustments. You decide which recommendations to keep, change, or skip.'],
    ["What if I don't like my coach?", 'You can switch between Iris and Reed. Each offers a different communication style while using the training context available in Delirio, and you remain free to change or ignore a recommendation.'],
    ['What happens if I stop for a while and come back?', 'You can return to the plan, conversations, and training context retained under your settings. Delirio can use that available context to make the next step clearer instead of forcing you to reconstruct everything from memory.'],
    ['Can I use this alongside a human trainer?', 'Yes. Delirio can create or adapt plans, support reflection, and maintain between-session consistency alongside a human trainer. Share relevant in-person training context with Delirio when you want it considered.'],
    ['Is my data private?', 'Delirio does not sell your personal information. We use service providers to operate features such as AI coaching, analytics, and messaging, as described in the Privacy Policy. You control camera, microphone, messaging, and available in-app data preferences.'],
    ["I've tried a bunch of things and nothing sticks. Why would this be different?", 'Delirio is designed for the moments when consistency usually breaks: busy weeks, missed sessions, changing equipment, and uncertainty about what to do next. It cannot guarantee a habit, but it can make returning clearer and require less replanning.'],
    ['Can Delirio support strength training while I use a GLP-1 medication?', 'Delirio can support a realistic strength routine while your energy, strength, body, or schedule is changing. It does not prescribe medication or provide medical or nutrition treatment. Follow the guidance of your prescribing clinician and use Delirio for fitness planning and coaching within its stated limits.'],
  ],
  PRICE: [
    [`Why pay $${MONTHLY_PRICE_USD}/month?`, `Delirio is $${MONTHLY_PRICE_USD} billed monthly, or $${YEARLY_PRICE_USD} billed annually—equivalent to $${YEARLY_MONTHLY_EQUIVALENT_USD} per month—for adaptive planning, workout guidance, form feedback where supported, and conversation between sessions.`],
    ['Can I cancel anytime?', 'Yes. No contracts, no cancellation fees.'],
  ],
};

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerAtTop, setHeaderAtTop] = useState(true);
  const [faqCategory, setFaqCategory] = useState<FaqCategory>('AI');
  const [openFaqs, setOpenFaqs] = useState(() => new Set<number>());
  const [visibleFaqCount, setVisibleFaqCount] = useState(INITIAL_FAQ_COUNT);
  const [selectedCoach, setSelectedCoach] = useState<CoachId | null>(null);
  const [mode, setMode] = useState<SessionMode>('voice');
  const [chatInput, setChatInput] = useState('');
  const [pendingCoach, setPendingCoach] = useState<CoachId | null>(null);
  const [hasVoiceEnded, setHasVoiceEnded] = useState(false);
  const [questionnaireOpen, setQuestionnaireOpen] = useState(false);
  const [questionnaireInvocation, setQuestionnaireInvocation] = useState(0);
  const [questionnaireStartsAtFirstQuestion, setQuestionnaireStartsAtFirstQuestion] = useState(false);
  const [autoQuestionnaireReady, setAutoQuestionnaireReady] = useState(false);
  const [sessionUserId] = useState(() => generateDiscoveryId());
  const faqPanelRef = useRef<HTMLDivElement>(null);
  const previousFaqHeightRef = useRef<number | null>(null);
  const hasAutoOpenedQuestionnaireRef = useRef(false);

  const activePersonality = selectedCoach ?? 'reed';
  const voice = useVoiceSession({ personality: activePersonality, userId: sessionUserId, context: 'default_app' });
  const { connect: connectVoice, disconnect: disconnectVoice, sessionState: voiceSessionState } = voice;
  const text = useTextChat({ personality: activePersonality, userId: sessionUserId, context: 'default_app' });
  const hasDestructiveContext = voiceSessionState === 'connected' || voiceSessionState === 'connecting' || text.messages.length > 0;
  const openQuestionnaire = useCallback((startAtFirstQuestion = false) => {
    hasAutoOpenedQuestionnaireRef.current = true;
    setQuestionnaireStartsAtFirstQuestion(startAtFirstQuestion);
    setQuestionnaireInvocation((current) => current + 1);
    setQuestionnaireOpen(true);
  }, []);
  const closeQuestionnaire = useCallback(() => setQuestionnaireOpen(false), []);

  useEffect(() => {
    const timer = window.setTimeout(() => setAutoQuestionnaireReady(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (
      !autoQuestionnaireReady
      || questionnaireOpen
      || hasAutoOpenedQuestionnaireRef.current
    ) return;
    hasAutoOpenedQuestionnaireRef.current = true;
    openQuestionnaire();
  }, [autoQuestionnaireReady, openQuestionnaire, questionnaireOpen]);

  useEffect(() => {
    let frame = 0;
    const updateHeader = () => {
      frame = 0;
      const atTop = window.scrollY <= 8;
      setHeaderAtTop(atTop);
      if (atTop) setMenuOpen(false);
    };
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateHeader);
    };
    updateHeader();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    return () => {
      window.removeEventListener('scroll', requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const applyCoach = useCallback((coach: CoachId) => {
    if (coach !== selectedCoach) {
      void disconnectVoice();
      text.clearMessages();
      setChatInput('');
      setHasVoiceEnded(false);
      setSelectedCoach(coach);
    }
  }, [disconnectVoice, selectedCoach, text]);

  function requestCoach(coach: CoachId) {
    if (coach === selectedCoach) return;
    if (selectedCoach && hasDestructiveContext) setPendingCoach(coach);
    else applyCoach(coach);
  }

  function startVoiceWithIris() {
    setMode('voice');
    requestCoach('iris');
  }

  function handleModeChange(nextMode: SessionMode) {
    if (nextMode === 'text' && mode === 'voice') {
      void disconnectVoice();
      setHasVoiceEnded(true);
    } else if (nextMode === 'voice' && mode !== 'voice') {
      setHasVoiceEnded(false);
    }
    setMode(nextMode);
  }

  useEffect(() => {
    if (!selectedCoach || mode !== 'voice' || hasVoiceEnded || voiceSessionState !== 'idle') return;
    void connectVoice();
  }, [connectVoice, hasVoiceEnded, mode, selectedCoach, voiceSessionState]);

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || text.isLoading) return;
    void text.sendMessage(message);
    setChatInput('');
  }

  useLayoutEffect(() => {
    const panel = faqPanelRef.current;
    const previousHeight = previousFaqHeightRef.current;
    previousFaqHeightRef.current = null;
    if (!panel || previousHeight === null || typeof panel.animate !== 'function') return;
    const nextHeight = panel.getBoundingClientRect().height;
    if (Math.abs(nextHeight - previousHeight) < 1 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    panel.style.overflow = 'hidden';
    const animation = panel.animate(
      [{ height: `${previousHeight}px` }, { height: `${nextHeight}px` }],
      { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' },
    );
    const restoreOverflow = () => { panel.style.overflow = ''; };
    animation.addEventListener('finish', restoreOverflow, { once: true });
    animation.addEventListener('cancel', restoreOverflow, { once: true });
    return () => animation.cancel();
  }, [faqCategory, openFaqs, visibleFaqCount]);

  function prepareFaqResize() {
    previousFaqHeightRef.current = faqPanelRef.current?.getBoundingClientRect().height ?? null;
  }

  function toggleFaq(index: number) {
    prepareFaqResize();
    setOpenFaqs((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function selectFaqCategory(category: FaqCategory) {
    if (category === faqCategory) return;
    prepareFaqResize();
    setFaqCategory(category);
    setOpenFaqs(new Set());
    setVisibleFaqCount(INITIAL_FAQ_COUNT);
  }

  function showMoreFaqs() {
    prepareFaqResize();
    setVisibleFaqCount((current) => Math.min(
      current + FAQ_BATCH_SIZE,
      faqSections[faqCategory].length,
    ));
  }

  return (
    <div className="d3-page">
      <a className="d3-skip" href="#main-content">Skip to main content</a>
      <header className={`d3-header ${headerAtTop ? 'is-at-top' : ''}`}>
        <Link className="d3-logo" to="/" aria-label="Delirio home" tabIndex={headerAtTop ? -1 : undefined}><Logo color="white" width="22" height="31" /></Link>
        <nav className={`d3-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Primary navigation">
          <a href="#product" onClick={() => setMenuOpen(false)}>Product</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
          <a href="#coaches" onClick={() => setMenuOpen(false)}>Coaches</a>
          <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
        </nav>
        <a className="d3-header-cta" href={APP_STORE_URL} rel="noopener noreferrer" target="_blank" tabIndex={headerAtTop ? -1 : undefined} aria-hidden={headerAtTop}>TRY 1 WEEK FREE</a>
        <button className="d3-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>
      <TopAnnouncementStrip visible={headerAtTop} />

      <main id="main-content">
        <HeroExperiment onTakeQuiz={() => openQuestionnaire(true)} />

        <section id="product" className="d3-system" aria-label="Delirio coaching experience">
          <section className="d3-problem-band" aria-labelledby="problem-band-title">
            <header className="d3-problem-intro">
              <h2 id="problem-band-title">WHEN STAYING FIT FEELS HARDER...</h2>
            </header>
            <div className="d3-movements">
              {frictionMoments.map(({ icon: PainPointIcon, title, copy }) => (
                <article key={title}>
                  <PainPointIcon className="d3-movement-icon" aria-hidden="true" strokeWidth={1.8} />
                  <div className="d3-movement-copy">
                    <h3>{title}</h3>
                    <p>{copy}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <ProductMomentsSection
            onStartVoice={startVoiceWithIris}
            onTakeQuiz={() => openQuestionnaire(true)}
          />
          <SessionStudio
            selectedCoach={selectedCoach} onSelectCoach={requestCoach}
            mode={mode} onModeChange={handleModeChange}
            voice={{ sessionState: voiceSessionState, isBotSpeaking: voice.isBotSpeaking, isBotProcessing: voice.isBotProcessing, isUserSpeaking: voice.isUserSpeaking, botTranscript: voice.botTranscript, botTurns: voice.botTurns, userTranscript: voice.userTranscript, failureKind: voice.failureKind, frequencyLevels: voice.frequencyLevels, isFrequencyListening: voice.isFrequencyListening, hasEnded: hasVoiceEnded, onStart: () => { setHasVoiceEnded(false); void connectVoice(); }, onCancel: () => { setHasVoiceEnded(true); void voice.cancelConnect(); }, onEnd: () => { setHasVoiceEnded(true); void disconnectVoice(); } }}
            text={{ messages: text.messages, input: chatInput, isLoading: text.isLoading, connectionState: text.connectionState, error: text.error, onInputChange: setChatInput, onSubmit: handleChatSubmit, onRetry: () => { void text.retryLastMessage(); } }}
          />
        </section>

        <section id="pricing" className="d3-pricing-wrap" aria-labelledby="pricing-title">
          <div className="d3-pricing">
            <div className="d3-pricing-intro">
              <h2 id="pricing-title">ONE COACH.<br />NO APPOINTMENT<br />TO RESCHEDULE.</h2>
              <p>Monthly and annual plans include the same coaching experience. Choose monthly flexibility or a lower annual equivalent—without losing voice, text, planning, or follow-up.</p>
              <p className="d3-pricing-contact">Contact <a href="mailto:contact@delirio.fit">contact@delirio.fit</a> for more information.</p>
            </div>
            <PlanCard kind="monthly" />
            <PlanCard kind="annual" />
          </div>
        </section>

        <FeedbackSection
          invocationId={questionnaireInvocation}
          open={questionnaireOpen}
          onClose={closeQuestionnaire}
          startAtFirstQuestion={questionnaireStartsAtFirstQuestion}
        />

        <section id="faq" className="d3-faq-wrap" aria-labelledby="faq-title">
          <div ref={faqPanelRef} className="d3-faq">
            <div className="d3-faq-left">
              <div className="d3-faq-intro">
                <h2 id="faq-title">CLEAR ANSWERS<br />BEFORE YOU START.</h2>
                <p>Understand what Delirio can do, where its limits are, and what stays in your control.</p>
              </div>
              <div className="d3-faq-categories" role="group" aria-label="FAQ categories">
                {faqCategories.map((category) => <button key={category} type="button" aria-pressed={faqCategory === category} onClick={() => selectFaqCategory(category)}>{faqCategoryLabels[category]}</button>)}
                <a className="d3-faq-contact" href="mailto:contact@delirio.fit"><Headset aria-hidden="true" /><span>Still have a question? Email contact@delirio.fit.</span></a>
              </div>
            </div>
            <div className="d3-faq-list" aria-live="polite">
              {faqSections[faqCategory].slice(0, visibleFaqCount).map(([question, answer], index) => {
                const open = openFaqs.has(index);
                return <article key={question}>
                  <h3>
                    <button type="button" aria-expanded={open} onClick={() => toggleFaq(index)}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <b>{question}</b>
                      {open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
                    </button>
                  </h3>
                  <div hidden={!open}><p>{answer}</p></div>
                </article>;
              })}
              {visibleFaqCount < faqSections[faqCategory].length && (
                <article className="d3-faq-more">
                  <h3>
                    <button type="button" onClick={showMoreFaqs}>
                      <b>MORE...</b>
                    </button>
                  </h3>
                </article>
              )}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter sectionPrefix="" />

      <ConfirmDialog open={pendingCoach !== null} coachName={pendingCoach ? coachProfiles[pendingCoach].name : ''} onCancel={() => setPendingCoach(null)} onConfirm={() => { if (pendingCoach) applyCoach(pendingCoach); setPendingCoach(null); }} />
    </div>
  );
}

function PlanCard({ kind }: { kind: 'monthly' | 'annual' }) {
  const annual = kind === 'annual';
  const price = annual ? YEARLY_PRICE_USD : MONTHLY_PRICE_USD;
  const annualSavings = MONTHLY_PRICE_USD * 12 - YEARLY_PRICE_USD;
  return <article className={`d3-plan d3-plan-${kind}`}><div className="d3-plan-tag">{annual ? 'BEST VALUE' : 'FLEXIBLE'}</div><p>{annual ? 'ANNUAL' : 'MONTHLY'}</p><h3>${price}</h3><strong>PER {annual ? 'YEAR' : 'MONTH'}</strong>{annual ? <><div className="d3-effective">${YEARLY_MONTHLY_EQUIVALENT_USD} / MONTH</div><small>SAVE ${annualSavings} VS. 12 MONTHLY PAYMENTS</small></> : <small>BILLED MONTHLY</small>}<ul>{benefits.map((benefit) => <li key={benefit}>✓&nbsp;&nbsp; {benefit}</li>)}</ul><a href={APP_STORE_URL} rel="noopener noreferrer" target="_blank">DOWNLOAD ON THE APP STORE</a></article>;
}
