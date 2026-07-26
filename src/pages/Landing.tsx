import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Headset, Menu, X } from 'lucide-react';
import irisAvatar from '../images/emojis/Iris/Iris_idle_return.png';
import reedAvatar from '../images/emojis/Reed/Reed_idle_return.png';
import { APP_STORE_URL, MONTHLY_PRICE_USD, YEARLY_MONTHLY_EQUIVALENT_USD, YEARLY_PRICE_USD } from '../config/product';
import { ConfirmDialog } from '../components/landing/ConfirmDialog';
import { FeedbackSection } from '../components/landing/FeedbackSection';
import { HeroExperiment } from '../components/landing/HeroExperiment';
import { LandingFooter } from '../components/landing/LandingFooter';
import { MessagingThreadSection } from '../components/landing/MessagingThreadSection';
import { ProductMomentsSection } from '../components/landing/ProductMomentsSection';
import { SessionStudio, type SessionMode } from '../components/landing/SessionStudio';
import { VoiceCoachingSection } from '../components/landing/VoiceCoachingSection';
import { Logo } from '../components/logo';
import { coachProfiles, type CoachId } from '../content/landingContent';
import { useTextChat } from '../hooks/useTextChat';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { generateDiscoveryId } from '../utils/pipecatConfig';

const movements = [
  ['01', 'LEARN', 'Starts with your schedule, experience, equipment, and what feels manageable this week.'],
  ['02', 'COACH', 'Notices reps, pace, rest, and the movement details it can assess while you train.'],
  ['03', 'ADAPT', 'Explains what mattered and adjusts the next session—with you in control.'],
] as const;

const memorySteps = [
  ['01', 'TEST EVERY MODE', 'Evaluate how the AI coaches plan, respond through text and voice, interpret live movement, and adjust what happens next.'],
  ['02', 'CHECK THE GUIDANCE', 'Review whether suggestions are relevant, understandable, within fitness scope, and appropriately cautious when context is incomplete.'],
  ['03', 'TUNE WITH CONTROL', 'Selected failure patterns become controlled cases for training and fine-tuning the AI coaches—not automatic lessons from a single conversation.'],
  ['04', 'RETEST EVERY CHANGE', 'After the AI coaches are trained or fine-tuned, run the full evaluation suite again across text, voice, planning, and live sessions.'],
] as const;

const benefits = ['Plan that adjusts with your week', 'Choose Iris or Reed', 'Voice + text coaching', 'Supported movement feedback', 'Strength exercise library', 'Optional SMS follow-up'];

type FaqCategory = 'AI' | 'COACHING' | 'PRODUCT' | 'PRICE';

const faqCategoryLabels: Record<FaqCategory, string> = {
  AI: 'About the AI',
  COACHING: 'About the coaching',
  PRODUCT: 'About the product',
  PRICE: 'About the price',
};

const faqCategories: FaqCategory[] = ['AI', 'COACHING', 'PRODUCT', 'PRICE'];

const faqSections: Record<FaqCategory, readonly (readonly [string, string])[]> = {
  AI: [
    ['Is this actually AI or a set of canned responses?', 'Delirio uses live AI to respond to your conversation and the workout context available to it. Responses are not selected from a fixed script, but AI can still misunderstand or make mistakes. You remain in control of important training decisions.'],
    ['What can Delirio assess through the camera?', 'With the camera on, Delirio uses pose estimation to assess supported movements and visible movement details. Camera angle, lighting, clothing, and whether your full body is visible can limit what it can assess. It provides fitness guidance, not injury assessment or medical diagnosis.'],
    ['What if talking to an AI coach feels unfamiliar?', 'Start with whichever format feels more comfortable: text or voice. You can switch modes, pause a conversation, or train without the camera. There is no requirement to use every coaching feature.'],
    ['How does voice coaching work?', 'Voice mode supports live back-and-forth during a session, using the conversation and available workout context. You can end the session at any time, and microphone access is requested only when you start voice mode.'],
  ],
  COACHING: [
    ["What's the difference between Reed and Iris?", 'Reed is focused and structured. Iris is attentive and encouraging. Choose the style that helps you feel clear and supported; you can switch coaches later. Both use the training context available in Delirio.'],
    ['Does Delirio replace a personal trainer?', 'Delirio can support planning, workout guidance, reflection, and follow-up. It is not a certified personal trainer or medical professional, cannot physically spot you, and does not diagnose pain or injury. You can also use it alongside a human trainer.'],
    ['What happens between workouts?', 'If you opt in, your coach can send reminders, check-ins, and follow-ups through your selected messaging channel. You control those preferences and can pause messages at any time.'],
    ['How is this different from a typical fitness app?', 'Most fitness apps provide plans, videos, and timers as separate tools. Delirio connects the plan, the session, what happened, and what should change next so you have a clearer way to continue.'],
    ['How is this different from online coaching?', 'Delirio provides automated guidance and conversation when you choose to use it, rather than relying on a scheduled human check-in. A human coach can offer judgment, physical assistance, and expertise that AI cannot, so the right choice depends on the support you need.'],
    ['Do I need to work out every day for this to be worth it?', "No. Your coach meets you where you are. Whether that's five days a week or two, the value is that someone is paying attention to your consistency and adjusting with you - not judging you for missing a day."],
    ['Will my coach push me too hard?', 'You stay in control. Pause, stop, take more rest, or change the plan when you need to. Delirio can recommend a progression, but you decide whether it fits how you feel today.'],
    ['Can my coach change my program mid-week if something comes up?', 'Yes. Tell your coach when your schedule, available equipment, or energy changes. Delirio can recommend a shorter session, a substitution, or an updated week for you to review.'],
    ['Can I talk to my coach about things outside of workouts?', 'You can share life context that affects training, such as travel, stress, or limited time. Delirio uses that context for fitness guidance; it does not provide therapy or medical advice.'],
  ],
  PRODUCT: [
    ['Can I text my coach or do I have to use the app?', "Both. You can message your coach through the app, over SMS, or on WhatsApp. Same coach, same conversation, whatever's convenient. Most people end up texting their coach the same way they'd text anyone else."],
    ['Does this work at a gym or only at home?', 'Both. You need your phone camera visible while you train, and space to move. That works in a living room, a garage, a park, or a gym floor.'],
    ['Do I need special equipment?', 'No. You need your phone and enough space to move. Your coach programs around whatever you have access to - bodyweight at home, a full gym, a hotel room with nothing.'],
    ['Do I have to use the camera every time?', 'No. The camera provides additional movement context when you choose to use it. You can still follow your plan and use text or voice without camera access.'],
    ['What kind of workouts can I do?', 'Strength training is the core focus. Your coach builds your splits, programs your progression, and watches your form through your camera. Activities like walks, runs, and mobility work fit alongside your strength plan.'],
    ['How long are the workouts?', "That depends on you. Your coach builds around the time you have. If you've got 30 minutes, you get a 30-minute session. If you've got an hour, you get an hour. No filler."],
    ['What if I already have a workout plan?', 'Your coach can work with it or help you build a new one. The value extends beyond the plan: clearer session guidance, useful reflection, and follow-through when your week changes.'],
    ["What if I'm a complete beginner?", 'You do not need to arrive knowing every exercise. Delirio can build a starting plan, explain movements, and offer guidance on the movement details it can assess. Start with manageable sessions and ask whenever something is unclear.'],
    ["What if I already know what I'm doing?", 'Experienced users can use Delirio for programming context, rep and rest support, session reflection, and plan adjustments. You decide which recommendations to keep, change, or skip.'],
    ["What if I don't like my coach?", 'You can switch. But give it a few sessions - the coaching gets more personal as your coach learns how you train, what motivates you, and what your patterns are.'],
    ['What happens if I stop for a while and come back?', 'Your coach remembers you. They know what you were working on, where you left off, and what was going on when you paused. No starting from scratch, no re-explaining your situation.'],
    ['Can I use this alongside a human trainer?', "Sure. Some people use Delirio for the days they're not with their trainer. Your coach picks up where your in-person sessions leave off."],
    ['Is my data private?', 'Delirio does not sell your personal information. We use service providers to operate features such as AI coaching, analytics, and messaging, as described in the Privacy Policy. You control camera, microphone, messaging, and available in-app data preferences.'],
    ["I've tried a bunch of things and nothing sticks. Why would this be different?", 'Delirio is designed for the moments when consistency usually breaks: busy weeks, missed sessions, changing equipment, and uncertainty about what to do next. It cannot guarantee a habit, but it can make returning clearer and require less replanning.'],
    ['Can Delirio support a weight-related goal?', 'Delirio can support a realistic strength routine alongside a weight-related goal, including when your body or schedule is changing. It does not provide medical or nutrition treatment. If you use prescription medication, follow the guidance of your prescribing clinician.'],
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
  const [openFaqs, setOpenFaqs] = useState(() => new Set([0]));
  const [selectedCoach, setSelectedCoach] = useState<CoachId | null>(null);
  const [mode, setMode] = useState<SessionMode>('voice');
  const [chatInput, setChatInput] = useState('');
  const [pendingCoach, setPendingCoach] = useState<CoachId | null>(null);
  const [hasVoiceEnded, setHasVoiceEnded] = useState(false);
  const [sessionUserId] = useState(() => generateDiscoveryId());
  const faqPanelRef = useRef<HTMLDivElement>(null);
  const previousFaqHeightRef = useRef<number | null>(null);

  const activePersonality = selectedCoach ?? 'reed';
  const voice = useVoiceSession({ personality: activePersonality, userId: sessionUserId, context: 'default_app' });
  const { connect: connectVoice, disconnect: disconnectVoice, sessionState: voiceSessionState } = voice;
  const text = useTextChat({ personality: activePersonality, userId: sessionUserId, context: 'default_app' });
  const hasDestructiveContext = voiceSessionState === 'connected' || voiceSessionState === 'connecting' || text.messages.length > 0;

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
  }, [faqCategory, openFaqs]);

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
    setOpenFaqs(new Set([0]));
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
        <a className="d3-header-cta" href="#coaches" tabIndex={headerAtTop ? -1 : undefined} aria-hidden={headerAtTop}>Build my plan</a>
        <button className="d3-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main id="main-content">
        <HeroExperiment />

        <section id="product" className="d3-system" aria-labelledby="system-title">
          <div className="d3-section-intro">
            <div><h2 id="system-title">ONE COACH.<br />FROM PLAN TO<br />PROGRESS.</h2></div>
            <div className="d3-coach-pair"><div><img src={irisAvatar} alt="Iris" /><img src={reedAvatar} alt="Reed" /></div><p>IRIS / REED<br />ONE SHARED MEMORY</p></div>
          </div>
          <div id="how-it-works" className="d3-movements">
            {movements.map(([number, title, copy]) => <article key={number}><h3><span>{number}</span> {title}</h3><p>{copy}</p></article>)}
          </div>
          <VoiceCoachingSection onStartVoice={() => { setMode('voice'); requestCoach('iris'); }} />
          <SessionStudio
            selectedCoach={selectedCoach} onSelectCoach={requestCoach}
            mode={mode} onModeChange={handleModeChange}
            voice={{ sessionState: voiceSessionState, isBotSpeaking: voice.isBotSpeaking, isBotProcessing: voice.isBotProcessing, isUserSpeaking: voice.isUserSpeaking, botTranscript: voice.botTranscript, botTurns: voice.botTurns, userTranscript: voice.userTranscript, failureKind: voice.failureKind, frequencyLevels: voice.frequencyLevels, isFrequencyListening: voice.isFrequencyListening, hasEnded: hasVoiceEnded, onStart: () => { setHasVoiceEnded(false); void connectVoice(); }, onCancel: () => { setHasVoiceEnded(true); void voice.cancelConnect(); }, onEnd: () => { setHasVoiceEnded(true); void disconnectVoice(); } }}
            text={{ messages: text.messages, input: chatInput, isLoading: text.isLoading, connectionState: text.connectionState, error: text.error, onInputChange: setChatInput, onSubmit: handleChatSubmit, onRetry: () => { void text.retryLastMessage(); } }}
          />
          <ProductMomentsSection />
        </section>

        <MessagingThreadSection />

        <section className="d3-memory" aria-labelledby="memory-title">
          <div className="d3-memory-intro"><h2 id="memory-title">CLEAR ABOUT WHAT<br />IS KNOWN. CLEAR ABOUT<br />WHAT ISN'T.</h2><p>The AI coaches do more than count reps. They can help shape a plan, respond through text or voice, interpret a live session, and suggest what should happen next. Every mode is evaluated for relevance, consistency, scope, and uncertainty before and after the AI coaches are trained or fine-tuned.</p></div>
          <div className="d3-loop">
            <div className="d3-memory-core">TEST<br />TUNE<br />RETEST</div>
            <i className="d3-memory-node is-top" aria-hidden="true" />
            <i className="d3-memory-node is-right" aria-hidden="true" />
            <i className="d3-memory-node is-bottom" aria-hidden="true" />
            <i className="d3-memory-node is-left" aria-hidden="true" />
            {memorySteps.map(([number, title, copy], index) => <article className={`step-${index + 1}`} key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
          </div>
          <div className="d3-memory-close"><h3>THE STANDARD ISN'T WHETHER AN AI COACH CAN ANSWER. IT'S WHETHER THE GUIDANCE DESERVES TO BE USED.</h3><p>Relevant in text. Composed in voice. Grounded during training. Clear about limits everywhere.</p></div>
        </section>

        <section id="pricing" className="d3-pricing-wrap" aria-labelledby="pricing-title">
          <div className="d3-pricing">
            <div className="d3-pricing-intro">
              <h2 id="pricing-title">ONE COACH.<br />CHOOSE WHAT FITS.</h2>
              <p>Monthly and annual plans include the same coaching experience. Choose the billing option that fits your plans.</p>
              <p className="d3-pricing-contact">Contact <a href="mailto:contact@delirio.fit">contact@delirio.fit</a> for more information.</p>
            </div>
            <PlanCard kind="monthly" />
            <PlanCard kind="annual" />
          </div>
        </section>

        <FeedbackSection />

        <section id="faq" className="d3-faq-wrap" aria-labelledby="faq-title">
          <div ref={faqPanelRef} className="d3-faq">
            <div className="d3-faq-left">
              <div className="d3-faq-intro">
                <h2 id="faq-title">CLEAR ANSWERS<br />BEFORE YOU START.</h2>
                <p>Understand what Delirio can do, where its limits are, and what stays in your control.</p>
                <small>CHOOSE A TOPIC</small>
              </div>
              <div className="d3-faq-categories" role="group" aria-label="FAQ categories">
                {faqCategories.map((category) => <button key={category} type="button" aria-pressed={faqCategory === category} onClick={() => selectFaqCategory(category)}>{faqCategoryLabels[category]}</button>)}
                <a className="d3-faq-contact" href="mailto:contact@delirial.fit"><Headset aria-hidden="true" /><span>Still have a question? Email contact@delirial.fit.</span></a>
              </div>
            </div>
            <div className="d3-faq-list" aria-live="polite">
              {faqSections[faqCategory].map(([question, answer], index) => { const open = openFaqs.has(index); return <article key={question}><h3><button type="button" aria-expanded={open} onClick={() => toggleFaq(index)}><span>{String(index + 1).padStart(2, '0')}</span><b>{question}</b>{open ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}</button></h3><div hidden={!open}><p>{answer}</p></div></article>; })}
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
  return <article className={`d3-plan d3-plan-${kind}`}><div className="d3-plan-tag">{annual ? 'BEST VALUE' : 'FLEXIBLE'}</div><p>{annual ? 'ANNUAL' : 'MONTHLY'}</p><h3>${price}</h3><strong>PER {annual ? 'YEAR' : 'MONTH'}</strong>{annual ? <><div className="d3-effective">${YEARLY_MONTHLY_EQUIVALENT_USD} / MONTH</div><small>SAVE ${annualSavings} VS. 12 MONTHLY PAYMENTS</small></> : <small>BILLED MONTHLY</small>}<ul>{benefits.map((benefit) => <li key={benefit}>—&nbsp;&nbsp; {benefit}</li>)}</ul><a href={APP_STORE_URL} target="_blank" rel="noreferrer">CHOOSE {annual ? 'ANNUAL' : 'MONTHLY'}</a></article>;
}
