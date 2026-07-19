import { useCallback, useEffect, useLayoutEffect, useRef, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Headset, Menu, X } from 'lucide-react';
import heroVideo from '../assets/videos/hero-prototype.mp4';
import irisAvatar from '../images/emojis/Iris/Iris_idle_return.png';
import reedAvatar from '../images/emojis/Reed/Reed_idle_return.png';
import { APP_STORE_URL, MONTHLY_PRICE_USD, YEARLY_MONTHLY_EQUIVALENT_USD, YEARLY_PRICE_USD } from '../config/product';
import { ConfirmDialog } from '../components/landing/ConfirmDialog';
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
  ['01', 'LEARN', 'Starts with goals, training history, constraints, and available equipment.'],
  ['02', 'COACH', 'Reads form, repetitions, selected load, total volume, and actual rest while you train.'],
  ['03', 'ADAPT', 'Explains what changed, then turns the session into a better next plan.'],
] as const;

const memorySteps = [
  ['01', 'BEFORE THE FIRST REP', 'Learns goals, history, constraints, available equipment, and why the user wants to change.'],
  ['02', 'DURING THE SET', 'Tracks form, repetitions, selected load, total volume, exercise progress, and actual rest time.'],
  ['03', 'AFTER THE SESSION', 'Explains what mattered: where form changed, whether the load fit, and what the break behavior suggests.'],
  ['04', 'BEFORE THE NEXT SESSION', 'Adjusts the plan from observed behavior instead of repeating the same static program.'],
] as const;

const benefits = ['Adaptive fitness plan', 'Iris or Reed', 'Voice + text coach', 'Live form feedback', 'Exercise directory', 'SMS coach access'];

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
    ['Is this actually a real AI or just a chatbot with canned responses?', "It's a real AI. Reed and Iris have distinct personalities, remember your history, and respond to what you actually say - not from a script. The conversations are live, whether you're texting between workouts or talking mid-session."],
    ['Can the AI actually see my form?', 'Yes. Your phone camera runs real-time pose estimation to track your body during exercises. Your coach gives you feedback on what it sees - not generic tips, corrections specific to your reps.'],
    ['Is this going to feel weird?', 'Honestly, for about two minutes. Then your coach says something that actually makes sense for what you just did, and it clicks. Most people adjust faster than they expect.'],
    ['Is the voice coaching awkward? Like talking to Siri?', "No. The voice is natural, the responses are contextual, and your coach is reacting to what you're actually doing - not running through a script. It's closer to having a trainer in your ear than talking to a voice assistant."],
  ],
  COACHING: [
    ["What's the difference between Reed and Iris?", "Reed is direct and structured - good if you want someone who keeps things focused and practical. Iris is expressive and energetic - good if you want someone who brings momentum. You pick the coach that fits how you like to be coached, and they're yours from that point on. They remember your history, your goals, and what you talked about last Tuesday."],
    ['Can this actually replace a personal trainer?', "For most people, yes. You get form correction, programming, accountability, and someone to talk to between sessions. What you don't get is someone physically spotting you on a heavy bench press. If that's what you need, we're not pretending to be that."],
    ['What happens between workouts?', "Your coach texts you. Check-ins, reminders, follow-ups on things you mentioned. You can text back whenever. It's not a notification machine - it's a conversation that continues."],
    ['How is this different from a fitness app?', "It's not a fitness app. Fitness apps give you content - videos, plans, timers - and leave you to figure it out. Delirio gives you a coach. Someone who knows your name, checks in on you between sessions, watches your form while you train, and remembers that you tweaked your shoulder two weeks ago. The difference is relationship, not features."],
    ['How is this different from online coaching?', "Most online coaches give you a Google Sheet and check in once a week. Your Delirio coach is available every day and watches your form live. The tradeoff is that it's AI, not a human - but for most people, daily AI coaching beats waiting on weekly check-ins."],
    ['Do I need to work out every day for this to be worth it?', "No. Your coach meets you where you are. Whether that's five days a week or two, the value is that someone is paying attention to your consistency and adjusting with you - not judging you for missing a day."],
    ['Will my coach push me too hard?', "Your coach adapts to you, not the other way around. If you're consistent and progressing, they'll push you. If you're recovering or having a rough week, they'll meet you there. That's what coaching is."],
    ['Can my coach change my program mid-week if something comes up?', "Yes. If you're traveling, sore, short on time, or just not feeling it, tell your coach. They'll adjust on the spot. The program serves you, not the other way around."],
    ['Can I talk to my coach about stuff outside of workouts?', "Your coach is a fitness coach, not a therapist. But the best trainers know that life affects training. If you're stressed, traveling, or going through something, your coach factors that in."],
  ],
  PRODUCT: [
    ['Can I text my coach or do I have to use the app?', "Both. You can message your coach through the app, over SMS, or on WhatsApp. Same coach, same conversation, whatever's convenient. Most people end up texting their coach the same way they'd text anyone else."],
    ['Does this work at a gym or only at home?', 'Both. You need your phone camera visible while you train, and space to move. That works in a living room, a garage, a park, or a gym floor.'],
    ['Do I need special equipment?', 'No. You need your phone and enough space to move. Your coach programs around whatever you have access to - bodyweight at home, a full gym, a hotel room with nothing.'],
    ['Do I have to use the camera every time?', "No. The camera gives your coach eyes on your form, so it's better when you use it. But you can still text, voice chat, and follow your program without it."],
    ['What kind of workouts can I do?', 'Strength training is the core focus. Your coach builds your splits, programs your progression, and watches your form through your camera. Activities like walks, runs, and mobility work fit alongside your strength plan.'],
    ['How long are the workouts?', "That depends on you. Your coach builds around the time you have. If you've got 30 minutes, you get a 30-minute session. If you've got an hour, you get an hour. No filler."],
    ['What if I already have a workout plan?', "Your coach can work with it or build you a new one. Either way, the value isn't just the plan - it's having someone watching your form and keeping you accountable to whatever plan you're following."],
    ["What if I'm a complete beginner?", "That's actually where this helps most. You don't have to walk into a gym knowing what to do. Your coach builds your program, walks you through the movements, and corrects your form in real time. No prerequisite knowledge needed."],
    ["What if I already know what I'm doing?", "Then you're not paying for education - you're paying for accountability and a second pair of eyes on your form. Even experienced lifters benefit from having someone watching their reps and keeping their programming honest."],
    ["What if I don't like my coach?", 'You can switch. But give it a few sessions - the coaching gets more personal as your coach learns how you train, what motivates you, and what your patterns are.'],
    ['What happens if I stop for a while and come back?', 'Your coach remembers you. They know what you were working on, where you left off, and what was going on when you paused. No starting from scratch, no re-explaining your situation.'],
    ['Can I use this alongside a human trainer?', "Sure. Some people use Delirio for the days they're not with their trainer. Your coach picks up where your in-person sessions leave off."],
    ['Is my data private?', "Yes. Your workout data, video, and conversations stay with us - we don't share or sell any of it to third parties."],
    ["I've tried a bunch of stuff and nothing sticks. Why would this be different?", "Probably because the other stuff left you on your own. Plans don't fail because they're bad plans - they fail because nobody's there to keep you going when it gets boring or life gets in the way. That's the whole point of having a coach."],
    ['Does this work for weight loss specifically?', 'Yes. Your coach can build programming around weight loss goals and check in on the habits that actually drive progress - not just the workouts, but everything around them.'],
  ],
  PRICE: [
    [`Why pay $${MONTHLY_PRICE_USD}/month?`, `A single trainer session can cost $50-150. Delirio is $${MONTHLY_PRICE_USD} billed monthly, or $${YEARLY_PRICE_USD} billed annually - equivalent to $${YEARLY_MONTHLY_EQUIVALENT_USD} per month - for ongoing access to your AI coach, programming, form feedback, and conversation between sessions.`],
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
  const text = useTextChat({ personality: activePersonality, userId: sessionUserId, context: 'default_app' });
  const hasDestructiveContext = voice.sessionState === 'connected' || voice.sessionState === 'connecting' || text.messages.length > 0;

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
      void voice.disconnect();
      text.clearMessages();
      setChatInput('');
      setHasVoiceEnded(false);
      setSelectedCoach(coach);
    }
  }, [selectedCoach, text, voice]);

  function requestCoach(coach: CoachId) {
    if (coach === selectedCoach) return;
    if (selectedCoach && hasDestructiveContext) setPendingCoach(coach);
    else applyCoach(coach);
  }

  function handleModeChange(nextMode: SessionMode) {
    if (nextMode === 'text' && (voice.sessionState === 'connected' || voice.sessionState === 'connecting')) {
      void voice.disconnect();
      setHasVoiceEnded(true);
    }
    setMode(nextMode);
  }

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
        <a className="d3-header-cta" href="#coaches" tabIndex={headerAtTop ? -1 : undefined} aria-hidden={headerAtTop}>Start training</a>
        <button className="d3-menu" type="button" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
      </header>

      <main id="main-content">
        <section className="d3-hero" aria-labelledby="hero-title">
          <video className="d3-hero-video" autoPlay loop muted playsInline preload="auto" aria-hidden="true"><source src={heroVideo} type="video/mp4" /></video>
          <div className="d3-hero-contrast" aria-hidden="true" />
          <div className="d3-hero-copy">
            <p className="d3-kicker">LIVE SESSION / ADAPTIVE COACHING</p>
            <h1 id="hero-title">YOUR TRAINING.<br />ADAPTED IN REAL TIME.</h1>
            <p className="d3-hero-support">One coach notices the work as it happens—and remembers what should change next.</p>
          </div>
          <div className="d3-hero-action-group">
            <a className="d3-hero-action" href="#coaches">SEE COACHES <span aria-hidden="true">→</span></a>
            <p className="d3-hero-capabilities">FORM / REPS / REST / SESSION MEMORY</p>
          </div>
        </section>

        <section id="product" className="d3-system" aria-labelledby="system-title">
          <div className="d3-section-intro">
            <div><h2 id="system-title">ONE SYSTEM.<br />THREE MOVEMENTS.</h2></div>
            <div className="d3-coach-pair"><div><img src={irisAvatar} alt="Iris" /><img src={reedAvatar} alt="Reed" /></div><p>IRIS / REED<br />ONE SHARED MEMORY</p></div>
          </div>
          <div id="how-it-works" className="d3-movements">
            {movements.map(([number, title, copy]) => <article key={number}><h3><span>{number}</span> {title}</h3><p>{copy}</p></article>)}
          </div>
          <VoiceCoachingSection onStartVoice={() => { setMode('voice'); requestCoach('iris'); }} />
          <SessionStudio
            selectedCoach={selectedCoach} onSelectCoach={requestCoach}
            mode={mode} onModeChange={handleModeChange}
            voice={{ sessionState: voice.sessionState, isMicMuted: voice.isMicMuted, isSpeakerMuted: voice.isSpeakerMuted, isBotSpeaking: voice.isBotSpeaking, isBotProcessing: voice.isBotProcessing, isUserSpeaking: voice.isUserSpeaking, botTranscript: voice.botTranscript, botTurns: voice.botTurns, userTranscript: voice.userTranscript, failureKind: voice.failureKind, retryAttempt: voice.retryAttempt, hasEnded: hasVoiceEnded, onStart: () => { setHasVoiceEnded(false); void voice.connect(); }, onCancel: () => { setHasVoiceEnded(true); void voice.cancelConnect(); }, onEnd: () => { setHasVoiceEnded(true); void voice.disconnect(); }, onToggleMic: voice.toggleMic, onToggleSpeaker: voice.toggleSpeakerMute }}
            text={{ messages: text.messages, input: chatInput, isLoading: text.isLoading, error: text.error, failedMessage: text.failedMessage, onInputChange: setChatInput, onSubmit: handleChatSubmit, onRetry: () => { void text.retryLastMessage(); } }}
          />
          <ProductMomentsSection />
        </section>

        <MessagingThreadSection />

        <section className="d3-memory" aria-labelledby="memory-title">
          <div className="d3-memory-intro"><h2 id="memory-title">MOST APPS STOP AT<br />THE PLAN. WE STAY<br />IN THE FRAME.</h2><p>The system is not a straight handoff. Every session feeds the next decision.</p></div>
          <div className="d3-loop">
            <div className="d3-memory-core">COACHING<br />MEMORY</div>
            {memorySteps.map(([number, title, copy], index) => <article className={`step-${index + 1}`} key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
          </div>
          <div className="d3-memory-close"><h3>THE NEXT PLAN IS BUILT FROM WHAT ACTUALLY HAPPENED.</h3><p>Not from a static template. Not from guesswork.</p></div>
        </section>

        <section id="pricing" className="d3-pricing-wrap" aria-labelledby="pricing-title">
          <div className="d3-pricing">
            <div className="d3-pricing-intro"><h2 id="pricing-title">TWO WAYS IN.<br />ONE COACH.</h2><p>Both plans include the same coaching system. The difference is how long you choose to commit.</p></div>
            <PlanCard kind="monthly" />
            <PlanCard kind="annual" />
          </div>
        </section>

        <section id="faq" className="d3-faq-wrap" aria-labelledby="faq-title">
          <div ref={faqPanelRef} className="d3-faq">
            <div className="d3-faq-left">
              <div className="d3-faq-intro">
                <h2 id="faq-title">QUESTIONS THAT<br />BLOCK THE YES.</h2>
                <p>Direct answers to the worries most likely to stop someone from starting.</p>
                <small>BEST USE / FINAL PRE-CTA</small>
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
