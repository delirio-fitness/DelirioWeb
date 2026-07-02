import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  MoveRight,
  Smartphone,
} from 'lucide-react';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import CallEndRoundedIcon from '@mui/icons-material/CallEndRounded';
import MicOffRoundedIcon from '@mui/icons-material/MicOffRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import { Logo } from '../components/logo';
import { LandingSiteFooter } from '../components/LandingSiteFooter';
import { LandingSiteHeader } from '../components/LandingSiteHeader';
import LandingBackgroundLines from '../components/LandingBackgroundLines';
import testFlightIcon from '../images/appleOfficialBadges/testFlight.webp';
import irisIdleReturn from '../images/emojis/Iris/Iris_idle_return.png';
import irisIdlePhone from '../images/emojis/Iris/Iris_idle_phone.png';
import irisIdleNotes from '../images/emojis/Iris/Iris_idle_notes.png';
import irisIdleWatch from '../images/emojis/Iris/Iris_idle_watch.png';
import irisListeningTilt from '../images/emojis/Iris/Iris_listening_tilt.png';
import irisThinkingConsider from '../images/emojis/Iris/Iris_thinking_consider.png';
import irisThinkingEmoji from '../images/emojis/Iris/Iris_thinking_emoji.png';
import reedIdleReturn from '../images/emojis/Reed/Reed_idle_return.png';
import reedIdlePhone from '../images/emojis/Reed/Reed_idle_phone.png';
import reedIdleNotes from '../images/emojis/Reed/Reed_idle_notes.png';
import reedIdleWatch from '../images/emojis/Reed/Reed_idle_watch.png';
import reedListeningTilt from '../images/emojis/Reed/Reed_listening_tilt.png';
import reedThinkingConsider from '../images/emojis/Reed/Reed_thinking_consider.png';
import reedThinkingEmoji from '../images/emojis/Reed/Reed_thinking_emoji.png';
import feedbackPushup from '../images/iMocksImages/realtime-feedback-pushup.png';
import feedbackSquat from '../images/iMocksImages/realtime-feedback-squat.png';
import messagingLeft from '../images/iMocksImages/blueChat_iMsg_iMock.png';
import messagingRight from '../images/iMocksImages/inApp_msging_iMock.png';
import { useTextChat } from '../hooks/useTextChat';
import { useVoiceSession } from '../hooks/useVoiceSession';
import { generateDiscoveryId } from '../utils/pipecatConfig';
import '../styles/landing-redesign.css';
type ClusterNode = {
  kind?: 'image' | 'text';
  src?: string;
  text?: string;
  top: string;
  left: string;
  size: number;
  rotate?: number;
  opacity?: number;
};

type FaqCategory = 'AI' | 'COACHING' | 'PRODUCT' | 'PRICE';

type FaqItem = {
  question: string;
  answer: string;
};

type ComparisonRow = {
  label: string;
  inPerson: string;
  online: string;
  delirio: string;
};

type CoachId = 'iris' | 'reed';

type InteractionMode = 'voice' | 'text';
type ContactActionsView = 'chooser' | 'voice' | 'text';

type CoachProfile = {
  name: string;
  accent: 'pink' | 'blue';
  avatar: string;
  blurb: string;
  approach: string;
};

type WaveSection =
  | 'hero'
  | 'features'
  | 'personalities'
  | 'form-feedback'
  | 'messaging'
  | 'comparison'
  | 'beta'
  | 'faq';

type WaveLineMotion = {
  blueAmp: number;
  pinkAmp: number;
  blueShiftX: number;
  blueShiftY: number;
  pinkShiftX: number;
  pinkShiftY: number;
  blueScaleX: number;
  pinkScaleX: number;
  blueRotate: number;
  pinkRotate: number;
  bluePath?: string;
  pinkPath?: string;
};

const heroNodes: ClusterNode[] = [
  { src: irisIdleReturn, top: '6%', left: '8%', size: 108, rotate: -2 },
  { kind: 'text', text: '\u{1F4A1}', top: '4%', left: '29%', size: 28 },
  { src: irisThinkingEmoji, top: '12%', left: '88%', size: 96, rotate: 2 },
  { src: reedThinkingConsider, top: '24%', left: '19%', size: 76, rotate: -5 },
  { src: irisThinkingConsider, top: '38%', left: '55%', size: 206, rotate: -1 },
  { src: reedIdleReturn, top: '52%', left: '5%', size: 68, rotate: 4 },
  { src: reedListeningTilt, top: '50%', left: '96%', size: 68, rotate: -3 },
  { src: irisIdlePhone, top: '66%', left: '17%', size: 182, rotate: -3 },
  { src: reedIdleWatch, top: '69%', left: '69%', size: 90, rotate: -2 },
  { src: irisIdleNotes, top: '82%', left: '6%', size: 78, rotate: -6 },
  { src: reedThinkingEmoji, top: '83%', left: '94%', size: 96, rotate: -2 },
  { src: irisIdleWatch, top: '92%', left: '44%', size: 130, rotate: 1 },
];

const betaNodes: ClusterNode[] = [
  { src: reedThinkingEmoji, top: '32%', left: '22%', size: 84, rotate: -4 },
  { src: irisIdlePhone, top: '20%', left: '38%', size: 58, rotate: -6 },
  { kind: 'text', text: '\u{1F4A1}', top: '20%', left: '44%', size: 24 },
  { src: irisThinkingConsider, top: '17%', left: '68%', size: 72, rotate: 2 },
  { src: irisThinkingEmoji, top: '33%', left: '75%', size: 96, rotate: -2 },
  { src: reedIdleNotes, top: '44%', left: '87%', size: 70, rotate: 6 },
  { src: reedIdleWatch, top: '57%', left: '12%', size: 72, rotate: -6 },
  { src: irisIdleWatch, top: '64%', left: '27%', size: 88, rotate: 5 },
  { src: irisListeningTilt, top: '86%', left: '35%', size: 84, rotate: -7 },
  { src: reedThinkingConsider, top: '76%', left: '52%', size: 84, rotate: 1 },
  { src: irisIdleReturn, top: '78%', left: '81%', size: 74, rotate: -4 },
  { src: reedListeningTilt, top: '94%', left: '90%', size: 94, rotate: -2 },
  { src: reedIdlePhone, top: '93%', left: '68%', size: 54, rotate: 2 },
  { kind: 'text', text: '\u{1F4A1}', top: '88%', left: '72%', size: 30 },
];

const TESTFLIGHT_DOWNLOAD_URL = "https://testflight.apple.com/join/sG9UyYY1";
const coachOrder: CoachId[] = ['reed', 'iris'];

const coachProfiles: Record<CoachId, CoachProfile> = {
  iris: {
    name: 'Iris',
    accent: 'pink',
    avatar: irisIdleReturn,
    blurb: 'Expressive, energetic coaching that keeps momentum high and sessions moving.',
    approach: '',
  },
  reed: {
    name: 'Reed',
    accent: 'blue',
    avatar: reedIdleReturn,
    blurb: 'Direct, structured coaching focused on clean execution and practical progression.',
    approach: '',
  },
};

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Presence',
    inPerson: 'In the room with you',
    online: 'Not there - you train alone',
    delirio: 'Watching your form live, talking during rest',
  },
  {
    label: 'Form feedback',
    inPerson: 'Real-time, in person',
    online: 'You send a video, they respond later',
    delirio: 'Real-time, live during your workout',
  },
  {
    label: 'Programming',
    inPerson: 'Varies by trainer',
    online: 'Google Sheet or PDF',
    delirio: 'Built and adjusted by your coach dynamically',
  },
  {
    label: 'Scheduling',
    inPerson: 'Fixed appointments',
    online: 'Async, but slow responses',
    delirio: 'On your schedule, always responsive',
  },
  {
    label: 'Cost',
    inPerson: '$50-150/session',
    online: '$150-200/month',
    delirio: '$50/month',
  },
];

const faqCategoryLabels: Record<FaqCategory, string> = {
  AI: 'About the AI',
  COACHING: 'About the coaching',
  PRODUCT: 'About the product',
  PRICE: 'About the price',
};

const faqOrder: FaqCategory[] = ['AI', 'COACHING', 'PRODUCT', 'PRICE'];

const faqItems: Record<FaqCategory, FaqItem[]> = {
  AI: [
    {
      question: 'Is this actually a real AI or just a chatbot with canned responses?',
      answer:
        "It's a real AI. Reed and Iris have distinct personalities, remember your history, and respond to what you actually say - not from a script. The conversations are live, whether you're texting between workouts or talking mid-session.",
    },
    {
      question: 'Can the AI actually see my form?',
      answer:
        'Yes. Your phone camera runs real-time pose estimation to track your body during exercises. Your coach gives you feedback on what it sees - not generic tips, corrections specific to your reps.',
    },
    {
      question: 'Is this going to feel weird?',
      answer:
        "Honestly, for about two minutes. Then your coach says something that actually makes sense for what you just did, and it clicks. Most people adjust faster than they expect.",
    },
    {
      question: 'Is the voice coaching awkward? Like talking to Siri?',
      answer:
        "No. The voice is natural, the responses are contextual, and your coach is reacting to what you're actually doing - not running through a script. It's closer to having a trainer in your ear than talking to a voice assistant.",
    },
  ],
  COACHING: [
    {
      question: "What's the difference between Reed and Iris?",
      answer:
        "Reed is direct and structured - good if you want someone who keeps things focused and practical. Iris is expressive and energetic - good if you want someone who brings momentum. You pick the coach that fits how you like to be coached, and they're yours from that point on. They remember your history, your goals, and what you talked about last Tuesday.",
    },
    {
      question: 'Can this actually replace a personal trainer?',
      answer:
        "For most people, yes. You get form correction, programming, accountability, and someone to talk to between sessions. What you don't get is someone physically spotting you on a heavy bench press. If that's what you need, we're not pretending to be that.",
    },
    {
      question: 'What happens between workouts?',
      answer:
        "Your coach texts you. Check-ins, reminders, follow-ups on things you mentioned. You can text back whenever. It's not a notification machine - it's a conversation that continues.",
    },
    {
      question: 'How is this different from a fitness app?',
      answer:
        "It's not a fitness app. Fitness apps give you content - videos, plans, timers - and leave you to figure it out. Delirio gives you a coach. Someone who knows your name, checks in on you between sessions, watches your form while you train, and remembers that you tweaked your shoulder two weeks ago. The difference is relationship, not features.",
    },
    {
      question: 'How is this different from online coaching?',
      answer:
        "Most online coaches give you a Google Sheet and check in once a week. Your Delirio coach is available every day and watches your form live. The tradeoff is that it's AI, not a human - but for most people, daily AI coaching beats waiting on weekly check-ins.",
    },
    {
      question: 'Do I need to work out every day for this to be worth it?',
      answer:
        "No. Your coach meets you where you are. Whether that's five days a week or two, the value is that someone is paying attention to your consistency and adjusting with you - not judging you for missing a day.",
    },
    {
      question: 'Will my coach push me too hard?',
      answer:
        "Your coach adapts to you, not the other way around. If you're consistent and progressing, they'll push you. If you're recovering or having a rough week, they'll meet you there. That's what coaching is.",
    },
    {
      question: 'Can my coach change my program mid-week if something comes up?',
      answer:
        "Yes. If you're traveling, sore, short on time, or just not feeling it, tell your coach. They'll adjust on the spot. The program serves you, not the other way around.",
    },
    {
      question: 'Can I talk to my coach about stuff outside of workouts?',
      answer:
        "Your coach is a fitness coach, not a therapist. But the best trainers know that life affects training. If you're stressed, traveling, or going through something, your coach factors that in.",
    },
  ],
  PRODUCT: [
    {
      question: 'Can I text my coach or do I have to use the app?',
      answer:
        "Both. You can message your coach through the app, over SMS, or on WhatsApp. Same coach, same conversation, whatever's convenient. Most people end up texting their coach the same way they'd text anyone else.",
    },
    {
      question: 'Does this work at a gym or only at home?',
      answer:
        'Both. You need your phone camera visible while you train, and space to move. That works in a living room, a garage, a park, or a gym floor.',
    },
    {
      question: 'Do I need special equipment?',
      answer:
        'No. You need your phone and enough space to move. Your coach programs around whatever you have access to - bodyweight at home, a full gym, a hotel room with nothing.',
    },
    {
      question: 'Do I have to use the camera every time?',
      answer:
        "No. The camera gives your coach eyes on your form, so it's better when you use it. But you can still text, voice chat, and follow your program without it.",
    },
    {
      question: 'What kind of workouts can I do?',
      answer:
        'Strength training is the core focus. Your coach builds your splits, programs your progression, and watches your form through your camera. Activities like walks, runs, and mobility work fit alongside your strength plan.',
    },
    {
      question: 'How long are the workouts?',
      answer:
        "That depends on you. Your coach builds around the time you have. If you've got 30 minutes, you get a 30-minute session. If you've got an hour, you get an hour. No filler.",
    },
    {
      question: 'What if I already have a workout plan?',
      answer:
        "Your coach can work with it or build you a new one. Either way, the value isn't just the plan - it's having someone watching your form and keeping you accountable to whatever plan you're following.",
    },
    {
      question: "What if I'm a complete beginner?",
      answer:
        "That's actually where this helps most. You don't have to walk into a gym knowing what to do. Your coach builds your program, walks you through the movements, and corrects your form in real time. No prerequisite knowledge needed.",
    },
    {
      question: "What if I already know what I'm doing?",
      answer:
        "Then you're not paying for education - you're paying for accountability and a second pair of eyes on your form. Even experienced lifters benefit from having someone watching their reps and keeping their programming honest.",
    },
    {
      question: "What if I don't like my coach?",
      answer:
        "You can switch. But give it a few sessions - the coaching gets more personal as your coach learns how you train, what motivates you, and what your patterns are.",
    },
    {
      question: 'What happens if I stop for a while and come back?',
      answer:
        'Your coach remembers you. They know what you were working on, where you left off, and what was going on when you paused. No starting from scratch, no re-explaining your situation.',
    },
    {
      question: 'Can I use this alongside a human trainer?',
      answer:
        "Sure. Some people use Delirio for the days they're not with their trainer. Your coach picks up where your in-person sessions leave off.",
    },
    {
      question: 'Is my data private?',
      answer: "Yes. Your workout data, video, and conversations stay with us - we don't share or sell any of it to third parties.",
    },
    {
      question: "I've tried a bunch of stuff and nothing sticks. Why would this be different?",
      answer:
        "Probably because the other stuff left you on your own. Plans don't fail because they're bad plans - they fail because nobody's there to keep you going when it gets boring or life gets in the way. That's the whole point of having a coach.",
    },
    {
      question: 'Does this work for weight loss specifically?',
      answer:
        'Yes. Your coach can build programming around weight loss goals and check in on the habits that actually drive progress - not just the workouts, but everything around them.',
    },
  ],
  PRICE: [
    {
      question: '$50/month - why should I pay that?',
      answer:
        "A single session with a trainer costs $50-150. You're getting daily access to a coach who watches your form, builds your program, and texts you between sessions. If you train three times a week, that's under $5 per session.",
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes. No contracts, no cancellation fees.',
    },
  ],
};

const waveSections: WaveSection[] = [
  'hero',
  'features',
  'personalities',
  'form-feedback',
  'messaging',
  'comparison',
  'beta',
  'faq',
];

const personalitiesBluePath =
  'M-120 360C170 236 402 500 734 398C1048 302 1282 220 1540 290C1728 344 1900 468 2050 484';

const personalitiesPinkPath =
  'M-120 858C200 976 492 996 818 816C1118 644 1412 620 1704 700C1868 740 1976 768 2050 786';

const waveMotionBySection: Record<WaveSection, WaveLineMotion> = {
  hero: { blueAmp: 1.22, pinkAmp: 0.9, blueShiftX: -2, blueShiftY: -10, pinkShiftX: 3, pinkShiftY: 12, blueScaleX: 1.02, pinkScaleX: 1.05, blueRotate: -1, pinkRotate: 1 },
  features: { blueAmp: 0.96, pinkAmp: 1.16, blueShiftX: -4, blueShiftY: -6, pinkShiftX: 2, pinkShiftY: 8, blueScaleX: 1.01, pinkScaleX: 1.03, blueRotate: -0.5, pinkRotate: 0.8 },
  personalities: {
    blueAmp: 1,
    pinkAmp: 1,
    blueShiftX: 0,
    blueShiftY: 0,
    pinkShiftX: 0,
    pinkShiftY: 0,
    blueScaleX: 1,
    pinkScaleX: 1,
    blueRotate: 0,
    pinkRotate: 0,
    bluePath: personalitiesBluePath,
    pinkPath: personalitiesPinkPath,
  },
  'form-feedback': { blueAmp: 1.1, pinkAmp: 0.98, blueShiftX: -2, blueShiftY: 8, pinkShiftX: 3, pinkShiftY: 14, blueScaleX: 1.02, pinkScaleX: 1.04, blueRotate: 0.4, pinkRotate: -0.4 },
  messaging: { blueAmp: 1.34, pinkAmp: 0.86, blueShiftX: -3, blueShiftY: 18, pinkShiftX: 2, pinkShiftY: 22, blueScaleX: 1.04, pinkScaleX: 1.08, blueRotate: 1.2, pinkRotate: -1.2 },
  comparison: { blueAmp: 1.28, pinkAmp: 0.92, blueShiftX: 0, blueShiftY: 0, pinkShiftX: 1, pinkShiftY: 14, blueScaleX: 1.04, pinkScaleX: 1.02, blueRotate: -0.6, pinkRotate: 0.6 },
  beta: { blueAmp: 1.28, pinkAmp: 1.12, blueShiftX: -1, blueShiftY: -2, pinkShiftX: 2, pinkShiftY: 8, blueScaleX: 1.03, pinkScaleX: 1.05, blueRotate: 0.5, pinkRotate: -0.2 },
  faq: { blueAmp: 0.94, pinkAmp: 1.18, blueShiftX: -2, blueShiftY: -6, pinkShiftX: 3, pinkShiftY: 4, blueScaleX: 1, pinkScaleX: 1.04, blueRotate: -0.3, pinkRotate: 0.5 },
};

function scrollToSection(sectionId: string, offsetPx: number = 0) {
  const section = document.getElementById(sectionId);
  if (!section) {
    return;
  }

  const scrollMarginTop = Number.parseFloat(window.getComputedStyle(section).scrollMarginTop || '0') || 0;
  const targetTop =
    window.scrollY + section.getBoundingClientRect().top - scrollMarginTop + offsetPx;

  window.scrollTo({
    top: Math.max(targetTop, 0),
    behavior: 'smooth',
  });
}

function FloatingCluster({
  nodes,
  className = '',
  eagerCount = 0,
  animationEnabled = true,
  burstFromLogo = false,
  burstOrigin = { left: 53, top: 54 },
}: {
  nodes: ClusterNode[];
  className?: string;
  eagerCount?: number;
  animationEnabled?: boolean;
  burstFromLogo?: boolean;
  burstOrigin?: { left: number; top: number };
}) {
  return (
    <div className={`landing-floating-cluster ${className} ${animationEnabled ? '' : 'is-static'}`.trim()}>
      {nodes.map((node, index) => {
        const floatDelay = burstFromLogo ? `${420 + index * 56}ms` : `${index * -0.75}s`;
        const burstDelay = `${80 + index * 42}ms`;

        const style = {
          top: 'var(--node-top)',
          left: 'var(--node-left)',
          width: `${node.size}px`,
          height: `${node.size}px`,
          fontSize: `${node.size}px`,
          transform: `translate(-50%, -50%) rotate(${node.rotate ?? 0}deg)`,
          opacity: node.opacity ?? 1,
          '--node-left': node.left,
          '--node-top': node.top,
          '--node-origin-left': `${burstOrigin.left}%`,
          '--node-origin-top': `${burstOrigin.top}%`,
          '--node-float-delay': floatDelay,
          '--node-burst-delay': burstDelay,
        } as CSSProperties;

        const nodeClassName = `landing-floating-node ${burstFromLogo ? 'landing-floating-node--burst' : ''} ${
          node.kind === 'text' ? 'landing-floating-node--text' : ''
        }`;

        if (node.kind === 'text') {
          return (
            <span key={`${node.text}-${index}`} className={nodeClassName} style={style} aria-hidden="true">
              <span className="landing-floating-node-content">{node.text}</span>
            </span>
          );
        }

        const shouldEagerLoad = index < eagerCount;
        return (
          <span key={`${node.src}-${index}`} className={nodeClassName} style={style} aria-hidden="true">
            <span className="landing-floating-node-content">
              <img
                src={node.src}
                alt=""
                loading={shouldEagerLoad ? 'eager' : 'lazy'}
                fetchPriority={ "high" /*shouldEagerLoad && index < 2 ? 'high' : 'auto'*/}
                decoding="async"
              />
            </span>
          </span>
        );
      })}
    </div>
  );
}

function PhoneMock({
  src,
  alt,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
}: {
  src: string;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'auto' | 'high' | 'low';
}) {
  return (
    <figure className={`landing-phone ${className}`}>
      <img src={src} alt={alt} loading={loading} fetchPriority={fetchPriority} decoding="async" />
    </figure>
  );
}

export default function Landing() {
  const testFlightAnimation = false;
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDownloadStripVisible, setIsDownloadStripVisible] = useState(false);
  const [activeCoach, setActiveCoach] = useState<CoachId>('reed');
  const [interactionMode, setInteractionMode] = useState<InteractionMode>('voice');
  const [contactActionsView, setContactActionsView] = useState<ContactActionsView>('chooser');
  const [coachSlideDirection, setCoachSlideDirection] = useState<1 | -1>(1);
  const [coachSlideTick, setCoachSlideTick] = useState(0);
  const [activeFaqCategory, setActiveFaqCategory] = useState<FaqCategory>('AI');
  const [openFaqQuestion, setOpenFaqQuestion] = useState<string>(faqItems.AI[0].question);
  const [activeWaveSection, setActiveWaveSection] = useState<WaveSection>('hero');
  const [sessionUserId] = useState(() => generateDiscoveryId());
  const [chatInput, setChatInput] = useState('');
  const [betaBurstTick, setBetaBurstTick] = useState(0);
  const [hasBetaFocused, setHasBetaFocused] = useState(false);

  const chatInputRef = useRef<HTMLInputElement | null>(null);
  const chatTranscriptRef = useRef<HTMLDivElement | null>(null);
  const previousCoachRef = useRef<CoachId>(activeCoach);
  const previousScrollYRef = useRef(0);
  const previousWaveSectionRef = useRef<WaveSection>('hero');
  const betaBurstDelayTimerRef = useRef<number | null>(null);

  const {
    sessionState,
    isMicMuted,
    isSpeakerMuted,
    connect,
    disconnect,
    toggleMic,
    toggleSpeakerMute,
  } = useVoiceSession({
    personality: activeCoach,
    userId: sessionUserId,
    context: 'default_app',
  });

  const {
    messages: chatMessages,
    isLoading: chatLoading,
    error: chatError,
    sendMessage,
    clearMessages,
  } = useTextChat({
    personality: activeCoach,
    userId: sessionUserId,
    context: 'default_app',
  });

  useEffect(() => {
    function onScroll() {
      const currentScrollY = Math.max(window.scrollY, 0);
      const hasScrolled = currentScrollY > 24;
      const previousScrollY = previousScrollYRef.current;
      const isScrollingDown = currentScrollY > previousScrollY + 1;
      const isScrollingUp = currentScrollY < previousScrollY - 1;

      setIsScrolled(hasScrolled);

      if (!hasScrolled || isScrollingUp) {
        setIsDownloadStripVisible(false);
      } else if (isScrollingDown) {
        setIsDownloadStripVisible(true);
      }

      previousScrollYRef.current = currentScrollY;
    }

    previousScrollYRef.current = Math.max(window.scrollY, 0);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const messagingSection = document.getElementById('messaging');
    if (!messagingSection) {
      return;
    }

    const nextProgress = activeWaveSection === 'messaging' ? 1 : 0;
    messagingSection.style.setProperty('--messaging-focus-progress', `${nextProgress}`);
  }, [activeWaveSection]);

  useEffect(() => {
    const messagingSection = document.getElementById('messaging');
    return () => {
      messagingSection?.style.removeProperty('--messaging-focus-progress');
    };
  }, []);

  useEffect(() => {
    const sectionElements = waveSections
      .map((section) => document.querySelector<HTMLElement>(`[data-wave-section="${section}"]`))
      .filter((section): section is HTMLElement => section !== null);

    if (!sectionElements.length) {
      return;
    }

    const updateActiveWaveSection = () => {
      const viewportMidline = window.innerHeight * 0.5;
      let nextSection: WaveSection = 'hero';
      let closestDistance = Number.POSITIVE_INFINITY;

      sectionElements.forEach((sectionElement) => {
        const sectionKey = sectionElement.getAttribute('data-wave-section') as WaveSection | null;

        if (!sectionKey || !waveSections.includes(sectionKey)) {
          return;
        }

        const rect = sectionElement.getBoundingClientRect();
        const containsMidline = rect.top <= viewportMidline && rect.bottom >= viewportMidline;

        if (containsMidline) {
          nextSection = sectionKey;
          closestDistance = -1;
          return;
        }

        if (closestDistance < 0) {
          return;
        }

        const sectionMidpoint = rect.top + rect.height / 2;
        const distance = Math.abs(sectionMidpoint - viewportMidline);

        if (distance < closestDistance) {
          closestDistance = distance;
          nextSection = sectionKey;
        }
      });

      setActiveWaveSection((current) => (current === nextSection ? current : nextSection));
    };

    updateActiveWaveSection();
    window.addEventListener('scroll', updateActiveWaveSection, { passive: true });
    window.addEventListener('resize', updateActiveWaveSection);

    return () => {
      window.removeEventListener('scroll', updateActiveWaveSection);
      window.removeEventListener('resize', updateActiveWaveSection);
    };
  }, []);

  useEffect(() => {
    if (!testFlightAnimation) {
      if (betaBurstDelayTimerRef.current !== null) {
        window.clearTimeout(betaBurstDelayTimerRef.current);
        betaBurstDelayTimerRef.current = null;
      }

      setHasBetaFocused(false);
      previousWaveSectionRef.current = activeWaveSection;
      return;
    }

    const previousSection = previousWaveSectionRef.current;
    const enteredBeta =
      activeWaveSection === 'beta' && previousSection !== 'beta';

    if (enteredBeta) {
      if (betaBurstDelayTimerRef.current !== null) {
        window.clearTimeout(betaBurstDelayTimerRef.current);
      }

      betaBurstDelayTimerRef.current = window.setTimeout(() => {
        setHasBetaFocused(true);
        setBetaBurstTick((current) => current + 1);
        betaBurstDelayTimerRef.current = null;
      }, 220);
    }

    previousWaveSectionRef.current = activeWaveSection;

    return () => {
      if (betaBurstDelayTimerRef.current !== null) {
        window.clearTimeout(betaBurstDelayTimerRef.current);
        betaBurstDelayTimerRef.current = null;
      }
    };
  }, [activeWaveSection, testFlightAnimation]);

  useEffect(() => {
    if (previousCoachRef.current === activeCoach) {
      return;
    }

    const shouldStayInTextMode =
      contactActionsView === 'text' || interactionMode === 'text';

    previousCoachRef.current = activeCoach;
    disconnect();
    clearMessages();
    setChatInput('');

    if (shouldStayInTextMode) {
      setInteractionMode('text');
      setContactActionsView('text');
      return;
    }

    setInteractionMode('voice');
    setContactActionsView('chooser');
  }, [activeCoach, clearMessages, contactActionsView, disconnect, interactionMode]);

  useEffect(() => {
    if (interactionMode === 'text' && (sessionState === 'connected' || sessionState === 'connecting')) {
      disconnect();
    }
  }, [disconnect, interactionMode, sessionState]);

  useEffect(() => {
    if (contactActionsView !== 'text') {
      return;
    }

    const focusTimer = window.setTimeout(() => {
      chatInputRef.current?.focus();
    }, 60);

    return () => window.clearTimeout(focusTimer);
  }, [contactActionsView]);

  useEffect(() => {
    if (contactActionsView !== 'text') {
      return;
    }

    const scrollTimer = window.setTimeout(() => {
      const transcript = chatTranscriptRef.current;
      if (!transcript) {
        return;
      }

      transcript.scrollTo({
        top: transcript.scrollHeight,
        behavior: 'smooth',
      });
    }, 40);

    return () => window.clearTimeout(scrollTimer);
  }, [chatMessages, chatLoading, contactActionsView]);

  function handleOpenVoicePanel() {
    setInteractionMode('voice');
    setContactActionsView('voice');

    if (sessionState === 'idle' || sessionState === 'error') {
      connect();
    }
  }

  function handleOpenTextPanel() {
    setInteractionMode('text');
    setContactActionsView('text');
  }

  function handleCoachSwitch(nextCoach: CoachId, forcedDirection?: 1 | -1) {
    if (nextCoach === activeCoach) {
      return;
    }

    const currentCoachIndex = coachOrder.indexOf(activeCoach);
    const nextCoachIndex = coachOrder.indexOf(nextCoach);
    const nextDirection: 1 | -1 =
      forcedDirection ?? (nextCoachIndex >= currentCoachIndex ? 1 : -1);

    setCoachSlideDirection(nextDirection);
    setCoachSlideTick((previous) => previous + 1);
    setActiveCoach(nextCoach);
  }

  function handleCycleCoach(direction: 1 | -1) {
    const currentCoachIndex = coachOrder.indexOf(activeCoach);
    const safeCurrentCoachIndex = currentCoachIndex < 0 ? 0 : currentCoachIndex;
    const nextCoachIndex =
      (safeCurrentCoachIndex + direction + coachOrder.length) % coachOrder.length;

    handleCoachSwitch(coachOrder[nextCoachIndex], direction);
  }

  function handleCloseContactActionsPanel() {
    if (sessionState === 'connected' || sessionState === 'connecting') {
      disconnect();
    }

    setContactActionsView('chooser');
    setInteractionMode('voice');
  }

  function handleHangupCall() {
    disconnect();
    setContactActionsView('chooser');
    setInteractionMode('voice');
  }

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedMessage = chatInput.trim();
    if (!trimmedMessage || chatLoading) {
      return;
    }

    sendMessage(trimmedMessage);
    setChatInput('');
  }

  function handleFaqCategoryChange(category: FaqCategory) {
    setActiveFaqCategory(category);
    setOpenFaqQuestion(faqItems[category][0].question);
  }

  const visibleFaqItems = faqItems[activeFaqCategory];
  const lineMotion = waveMotionBySection[activeWaveSection];
  const activeCoachProfile = coachProfiles[activeCoach];
  const inactiveCoach = coachOrder.find((coachId) => coachId !== activeCoach) ?? activeCoach;
  const inactiveCoachProfile = coachProfiles[inactiveCoach];
  const isPersonalitySectionActive = activeWaveSection === 'personalities';
  const travelBlue = isPersonalitySectionActive && activeCoach === 'reed';
  const travelPink = isPersonalitySectionActive && activeCoach === 'iris';

  //wave behavior switch : swicthes on/off the wave behaviour in the baackground blue and pink lines 
  const waveBehaviour = true;
  return (
    <div className="landing-shell">
      <LandingBackgroundLines
        waveBehaviour={waveBehaviour}
        bluePath={lineMotion.bluePath}
        pinkPath={lineMotion.pinkPath}
        blueAmplitude={lineMotion.blueAmp}
        pinkAmplitude={lineMotion.pinkAmp}
        blueShiftX={lineMotion.blueShiftX}
        blueShiftY={lineMotion.blueShiftY}
        pinkShiftX={lineMotion.pinkShiftX}
        pinkShiftY={lineMotion.pinkShiftY}
        blueScaleX={lineMotion.blueScaleX}
        pinkScaleX={lineMotion.pinkScaleX}
        blueRotate={lineMotion.blueRotate}
        pinkRotate={lineMotion.pinkRotate}
        travelBlue={travelBlue}
        travelPink={travelPink}
      />
      <LandingSiteHeader
        isScrolled={isScrolled}
        isStripVisible={isDownloadStripVisible}
        onFeaturesClick={() => scrollToSection('personalities')}
        onPersonalitiesClick={() => scrollToSection('form-feedback')}
        onTestFlightClick={() => scrollToSection('contact-capture')}
        downloadUrl={TESTFLIGHT_DOWNLOAD_URL}
      />

      <main className="landing-main">
        <section id="hero" data-wave-section="hero" className="landing-section landing-section--hero">
          <div className="landing-container landing-eyecatcher">
            
            <div className="landing-eyecatcher-copy">
              <p className="landing-eyecatcher-kicker">PERSONAL TRAINING</p>
              <h1 className="landing-display landing-display--hero landing-display--hero-flex">
                <span>GUIDANCE</span>
                <span>THAT</span>
                <span className="landing-display-blue">SHOWS</span>
                <span className="landing-display-blue">UP</span>
                <span className="landing-display-blue">WHEN</span>
                <span className="landing-display-blue">YOU</span>
                <span className="landing-display-blue">DO.</span>
              </h1>
              <div className="landing-eyecatcher-body">
                <p>More personal training for less — more guidance than online plans, without the cost or hassle of in-person training.</p>
              </div>
              <button className="landing-outline-button landing-outline-button--hero" type="button" onClick={() => scrollToSection('personalities', 264)}>
                <span>Find your coach</span>
                <MoveRight size={20} />
              </button>
            </div>

            <div className="landing-eyecatcher-visual">
              <FloatingCluster nodes={heroNodes} className="landing-floating-cluster--hero" eagerCount={6} />
            </div>
            
          </div>
        </section>

        <section
          id="personalities"
          data-wave-section="personalities"
          className="landing-section landing-section--personality-spotlight"
        >
          <div className="landing-container landing-personality-spotlights landing-personality-experience">
            <h2 className="landing-heading landing-heading--center">
              <span>MEET YOUR</span> <span className="landing-display-blue">COACH</span>
            </h2>
            <p className="landing-comparison-subtitle">
              Same workout. Different coaching style. Switch between Reed and Iris to feel the difference in action.
            </p>

            <div className="landing-personality-experience-shell">
	              <div className={`landing-personality-stage ${contactActionsView === 'text' ? 'is-text-mode' : ''}`} aria-live="polite">
                <div className="landing-personality-stage-shell">
                  {contactActionsView === 'text' ? (
                    <button
                      type="button"
                      className="landing-personality-stage-back landing-personality-stage-back--corner"
                      onClick={handleCloseContactActionsPanel}
                      aria-label="Back to contact options"
                    >
                      <ChevronLeft size={18} aria-hidden="true" />
                      <span>Back</span>
                    </button>
                  ) : null}
                  <button
                    type="button"
                    key={`${inactiveCoach}-${coachSlideTick}`}
                    className={`landing-personality-stage-ghost landing-personality-stage-ghost--${inactiveCoach}`}
                    onClick={() => handleCoachSwitch(inactiveCoach)}
                    aria-label={`Switch to ${inactiveCoachProfile.name}`}
                  >
                    <img src={inactiveCoachProfile.avatar} alt="" />
                  </button>
                  <div className="landing-personality-stage-focus">
                    {contactActionsView !== 'text' ? (
                      <button
                        type="button"
                        className="landing-personality-stage-switch landing-personality-stage-switch--left"
                        onClick={() => handleCycleCoach(-1)}
                        aria-label="Show previous coach"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    ) : null}
                    {contactActionsView === 'chooser' ? (
                      <button
                        type="button"
                        key={`${activeCoach}-${coachSlideTick}`}
                        className={`landing-personality-stage-avatar landing-personality-stage-avatar-button landing-personality-stage-avatar--${activeCoach} ${
                          coachSlideDirection > 0
                            ? 'landing-personality-stage-avatar--descend-forward'
                            : 'landing-personality-stage-avatar--descend-backward'
                        } ${interactionMode === 'voice' && sessionState === 'connected' ? 'landing-personality-stage-avatar--voice' : ''}`}
                        onClick={() => handleCoachSwitch(inactiveCoach)}
                        aria-label={`Switch to ${inactiveCoachProfile.name}`}
                      >
                        <img src={activeCoachProfile.avatar} alt={`${activeCoachProfile.name} coach avatar`} />
                      </button>
                    ) : (
                      <div
                        key={`${activeCoach}-${coachSlideTick}`}
                        className={`landing-personality-stage-avatar landing-personality-stage-avatar--${activeCoach} ${
                          coachSlideDirection > 0
                            ? 'landing-personality-stage-avatar--descend-forward'
                            : 'landing-personality-stage-avatar--descend-backward'
                        } ${interactionMode === 'voice' && sessionState === 'connected' ? 'landing-personality-stage-avatar--voice' : ''}`}
                      >
                        <img src={activeCoachProfile.avatar} alt={`${activeCoachProfile.name} coach avatar`} />
                      </div>
                    )}
                    {contactActionsView !== 'text' ? (
                      <button
                        type="button"
                        className="landing-personality-stage-switch landing-personality-stage-switch--right"
                        onClick={() => handleCycleCoach(1)}
                        aria-label="Show next coach"
                      >
                        <ChevronRight size={24} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="landing-personality-stage-nav">
                  <div className="landing-personality-stage-meta">
	                    <p
	                      className={`landing-personality-stage-name landing-personality-stage-name--${activeCoachProfile.accent} ${
	                        contactActionsView === 'text' ? 'landing-personality-stage-name--compact' : ''
	                      }`}
	                    >
	                      {activeCoachProfile.name}
	                    </p>
	                    {contactActionsView !== 'text' ? (
	                      <p className="landing-personality-stage-blurb">{activeCoachProfile.blurb}</p>
	                    ) : null}
	                    {contactActionsView !== 'text' && activeCoachProfile.approach ? (
	                      <p className="landing-personality-stage-approach">{activeCoachProfile.approach}</p>
	                    ) : null}
                  </div>
                </div>

                <div
                  className={`landing-personality-contact-actions landing-personality-contact-actions--${activeCoachProfile.accent}`}
                  aria-label="Choose contact method"
                >
                  {contactActionsView === 'chooser' && (
                    <div className="landing-contact-actions-chooser">
                      <button
                        type="button"
                        className={`landing-contact-action landing-contact-action--call ${interactionMode === 'voice' ? 'is-active' : ''}`.trim()}
                        onClick={handleOpenVoicePanel}
                      >
                        <CallRoundedIcon className="landing-contact-action-icon" />
                        <span className="landing-contact-action-label">Call</span>
                      </button>
                      <button
                        type="button"
                        className={`landing-contact-action landing-contact-action--text ${interactionMode === 'text' ? 'is-active' : ''}`.trim()}
                        onClick={handleOpenTextPanel}
                      >
                        <SendRoundedIcon className="landing-contact-action-icon" />
                        <span className="landing-contact-action-label">Text</span>
                      </button>
                    </div>
                  )}

                  {contactActionsView === 'voice' && (
                    <div className="landing-contact-panel landing-contact-panel--voice" role="group" aria-label="Voice call controls">
                      <div className="landing-contact-panel-head">

                        <button
                          type="button"
                          className="landing-contact-panel-back"
                          onClick={handleCloseContactActionsPanel}
                        >
                          <ChevronLeft size={16} aria-hidden="true" />
                          Back
                        </button>
                      </div>
                      <div className="landing-voice-control-row">
                        <button
                          type="button"
                          className="landing-voice-icon-button"
                          onClick={toggleMic}
                          aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                          aria-pressed={isMicMuted}
                        >
                          {isMicMuted ? <MicOffRoundedIcon /> : <MicRoundedIcon />}
                        </button>
                        <button
                          type="button"
                          className="landing-voice-hangup-button"
                          onClick={handleHangupCall}
                          aria-label="Hang up call"
                        >
                          <CallEndRoundedIcon className="landing-voice-hangup-icon" />
                        </button>
                        <button
                          type="button"
                          className="landing-voice-icon-button"
                          onClick={toggleSpeakerMute}
                          aria-label={isSpeakerMuted ? 'Unmute speaker' : 'Mute speaker'}
                        >
                          {isSpeakerMuted ? <VolumeOffRoundedIcon /> : <VolumeUpRoundedIcon />}
                        </button>
                      </div>
                    </div>
                  )}

                  {contactActionsView === 'text' && (
                    <form className="landing-contact-panel landing-contact-panel--text" onSubmit={handleChatSubmit}>
                      <div
                        ref={chatTranscriptRef}
                        className="landing-chat-transcript"
                        aria-live="polite"
                        aria-label="Chat transcript"
                      >
                        {!chatMessages.length && !chatLoading ? (
                          <p className="landing-chat-transcript-empty">
                            Send a message to start chatting with {activeCoachProfile.name}.
                          </p>
                        ) : null}

                        {chatMessages.map((message, index) => (
                          <div
                            key={`${message.role}-${index}`}
                            className={`landing-chat-bubble-row landing-chat-bubble-row--${message.role}`}
                          >
                            <p className={`landing-chat-bubble landing-chat-bubble--${message.role}`}>{message.text}</p>
                          </div>
                        ))}

                        {chatLoading ? (
                          <div className="landing-chat-bubble-row landing-chat-bubble-row--assistant">
                            <p className="landing-chat-bubble landing-chat-bubble--assistant landing-chat-bubble--typing">...</p>
                          </div>
                        ) : null}
                      </div>
                      <div className="landing-text-composer">
                        <input
                          ref={chatInputRef}
                          type="text"
                          placeholder="iMessage"
                          value={chatInput}
                          onChange={(event) => setChatInput(event.target.value)}
                          disabled={chatLoading}
                        />
                        <button
                          type="submit"
                          className="landing-text-send-button"
                          aria-label="Send message"
                          disabled={chatLoading || !chatInput.trim()}
                        >
                          <SendRoundedIcon />
                        </button>
                      </div>
                      {chatError && <p className="landing-contact-panel-error">{chatError}</p>}
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="form-feedback" data-wave-section="form-feedback" className="landing-section landing-section--form-feedback">
          <div className="landing-container landing-form-feedback">
            <div className="landing-form-feedback-copy">
              <h2 className="landing-display landing-display--section">
                <span>REAL FEEDBACK.</span>
                <span className="landing-display-blue">REAL-TIME.</span>
              </h2>
              <p className="landing-section-body">
                Your coach tracks your movement live and gives corrections during the set, not after it. You train with
                eyes on your form the whole time.
              </p>
            </div>

            <div className="landing-form-feedback-visual">
              <PhoneMock src={feedbackPushup} alt="Live form feedback during workout session" className="landing-phone--feedback-main" />
              <PhoneMock src={feedbackSquat} alt="Activity view with live coaching context" className="landing-phone--feedback-right" />
            </div>
          </div>
        </section>

        <section
          id="messaging"
          data-wave-section="messaging"
          className="landing-section landing-section--messaging"
        >
          <div className="landing-container landing-messaging">
            <h2 className="landing-heading landing-heading--center landing-heading--connect-schedule">
              <span>MULTIPLE WAYS TO</span>
              <span className="landing-display-blue">CONNECT</span>
              <span>&amp;</span>
              <span className="landing-display-blue">SCHEDULE.</span>
            </h2>
            <p className="landing-comparison-subtitle">
              Text, voice, or in-app chat with the same coach and build your routine in the same thread:
              generate your split, adjust your schedule, and update the plan in real time.
            </p>

            <div className="landing-messaging-grid">
              <div className="landing-messaging-column">
                <div className="landing-messaging-label landing-messaging-label--blue">
                  <span className="landing-icon-badge landing-icon-badge--blue" aria-hidden="true">
                    <MessageCircle size={36} />
                  </span>
                  <span style = {{fontWeight:"bolder"}}>TEXT</span>
                </div>
                <div className="landing-messaging-stack landing-messaging-stack--blue">
                  <PhoneMock
                    src={messagingLeft}
                    alt="SMS coaching conversation"
                    className="landing-phone--messaging landing-phone--messaging-main"
                  />
                  <PhoneMock
                    src={messagingRight}
                    alt="In-app coaching thread placeholder"
                    className="landing-phone--messaging landing-phone--messaging-secondary"
                  />
                </div>
              </div>

              <div className="landing-messaging-column landing-messaging-column--right">
                <div className="landing-messaging-label landing-messaging-label--pink">
                  <span className="landing-icon-badge landing-icon-badge--pink" aria-hidden="true">
                    <Smartphone size={36} />
                  </span>
                  <span style = {{fontWeight:"bolder"}}>
                    VOICE 
                  </span>
                </div>
                <div className="landing-messaging-stack landing-messaging-stack--pink">
                  <PhoneMock
                    src={messagingRight}
                    alt="In-app coach chat"
                    className="landing-phone--messaging landing-phone--messaging-main"
                  />
                  <PhoneMock
                    src={messagingLeft}
                    alt="SMS coaching thread placeholder"
                    className="landing-phone--messaging landing-phone--messaging-secondary"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="comparison" data-wave-section="comparison" className="landing-section landing-section--comparison">
          <div className="landing-container landing-comparison">
            <h2 className="landing-heading landing-heading--center">
              THE BEST OF BOTH <span className="landing-display-blue">WORLDS</span>
            </h2>
            <p className="landing-comparison-subtitle landing-subheading-match">
              In-person trainers bring presence but limited access. Online coaching is asynchronous and often distant.
              Delirio combines live presence with everyday availability.
            </p>

            <div className="landing-comparison-matrix" role="table" aria-label="Coaching comparison table">
              <div className="landing-comparison-row landing-comparison-row--head" role="row">
                <div className="landing-comparison-cell landing-comparison-cell--label" role="columnheader" />
                <div className="landing-comparison-cell" role="columnheader">In-Person Trainer</div>
                <div className="landing-comparison-cell" role="columnheader">Online Coaching</div>
                <div className="landing-comparison-cell landing-comparison-cell--delirio" role="columnheader">Delirio</div>
              </div>

              {comparisonRows.map((row) => (
                <div key={row.label} className="landing-comparison-row" role="row">
                  <div className="landing-comparison-cell landing-comparison-cell--label" role="rowheader">
                    {row.label}
                  </div>
                  <div className="landing-comparison-cell" role="cell">{row.inPerson}</div>
                  <div className="landing-comparison-cell" role="cell">{row.online}</div>
                  <div className="landing-comparison-cell landing-comparison-cell--delirio" role="cell">{row.delirio}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" data-wave-section="faq" className="landing-section landing-section--faq">
          <div className="landing-container landing-faq">
            <div className="landing-faq-title">
              <h2 className="landing-heading">FAQ</h2>
            </div>

            <div className="landing-faq-layout">
              <div className="landing-faq-categories" aria-label="FAQ categories">
                {faqOrder.map((category) => (
                  <button
                    key={category}
                    style = {{
                      fontSize: 20
                    }}
                    type="button"
                    className={category === activeFaqCategory ? 'is-active' : ''}
                    onClick={() => handleFaqCategoryChange(category)}
                  >
                    {faqCategoryLabels[category]}
                  </button>
                ))}
              </div>

              <div className="landing-faq-list">
                {visibleFaqItems.map((item, index) => {
                  const isOpen = item.question === openFaqQuestion;
                  const answerId = `faq-answer-${activeFaqCategory.toLowerCase()}-${index}`;
                  return (
                    <div key={item.question} className={`landing-faq-item ${isOpen ? 'landing-faq-item--open' : ''}`}>
                      <button
                        type="button"
                        className="landing-faq-question"
                        aria-expanded={isOpen}
                        aria-controls={answerId}
                        onClick={() => setOpenFaqQuestion(isOpen ? '' : item.question)}
                      >
                        <span>{item.question}</span>
                        <ChevronRight size={24} />
                      </button>
                      <div id={answerId} className="landing-faq-answer" aria-hidden={!isOpen}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}

                <a className="landing-faq-more" href="mailto:contact@delirio.fit">
                  Still have a question? Email contact@delirio.fit
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="contact-capture" data-wave-section="beta" className="landing-section landing-section--warm-network" aria-label="TestFlight beta">
          <div className="landing-container landing-warm-network">
            <div className="landing-warm-copy">
              <h2 className="landing-display landing-display--section landing-warm-title">
                <span>BECOME A</span>
                <span className="landing-display-blue">BETA USER</span>
                <span>TODAY</span>
              </h2>
              <p className="landing-section-body landing-warm-body landing-subheading-match">
                Try Delirio early on TestFlight and help shape what comes next.
              </p>
            </div>

            <div className="landing-warm-visual landing-beta-visual">
              <FloatingCluster
                key={testFlightAnimation ? `beta-burst-${betaBurstTick}` : 'beta-static'}
                nodes={betaNodes}
                className="landing-floating-cluster--beta"
                animationEnabled={testFlightAnimation}
                burstFromLogo={testFlightAnimation && hasBetaFocused}
              />

              <div className="landing-beta-stage">
                <div className="landing-beta-logo-block">
                  <Logo width="50" height="auto" />
                </div>
                <a className="landing-testflight-cta" href={TESTFLIGHT_DOWNLOAD_URL} target="_blank" rel="noreferrer">
                  <img src={testFlightIcon} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                  <span className="landing-testflight-cta-copy">
                    <span>Available on</span>
                    <strong>TestFlight</strong>
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingSiteFooter />
    </div>
  );
}
