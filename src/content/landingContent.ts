import irisAvatar from '../images/emojis/Iris/Iris_idle_return.png';
import reedAvatar from '../images/emojis/Reed/Reed_idle_return.png';
import {
  MONTHLY_PRICE_USD,
  YEARLY_MONTHLY_EQUIVALENT_USD,
  YEARLY_PRICE_USD,
} from '../config/product';

export type CoachId = 'reed' | 'iris';
export type FaqCategory = 'AI' | 'COACHING' | 'PRODUCT' | 'PRICE';

export interface CoachProfile {
  id: CoachId;
  name: string;
  accent: 'blue' | 'pink';
  avatar: string;
  blurb: string;
  style: string;
  pace: string;
  structure: string;
  encouragement: string;
  sample: string;
}

export interface ComparisonRow {
  label: string;
  inPerson: string;
  online: string;
  delirio: string;
}

export interface FaqItem {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
}

export const coachProfiles: Record<CoachId, CoachProfile> = {
  reed: {
    id: 'reed',
    name: 'Reed',
    accent: 'blue',
    avatar: reedAvatar,
    blurb: 'Direct, structured coaching focused on clean execution and practical progression.',
    style: 'Direct and practical',
    pace: 'Focused momentum',
    structure: 'Clear next steps',
    encouragement: 'Progress through execution',
    sample: 'We’ll keep it focused: three compound movements, clean sets, and no wasted time.',
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    accent: 'pink',
    avatar: irisAvatar,
    blurb: 'Expressive, energetic coaching that keeps momentum high and sessions moving.',
    style: 'Expressive and energetic',
    pace: 'Upbeat momentum',
    structure: 'Flexible guidance',
    encouragement: 'Energy through connection',
    sample: 'Thirty minutes is plenty. Let’s build a sharp session and keep your momentum high.',
  },
};

export const comparisonRows: ComparisonRow[] = [
  {
    label: 'Presence',
    inPerson: 'In the room with you',
    online: 'Not there — you train alone',
    delirio: 'Camera-enabled form feedback and coaching during training',
  },
  {
    label: 'Form feedback',
    inPerson: 'Real-time, in person',
    online: 'You send a video, they respond later',
    delirio: 'Camera-enabled feedback during your workout',
  },
  {
    label: 'Programming',
    inPerson: 'Varies by trainer',
    online: 'Google Sheet or PDF',
    delirio: 'Built and adjusted as your training context changes',
  },
  {
    label: 'Scheduling',
    inPerson: 'Fixed appointments',
    online: 'Asynchronous communication',
    delirio: 'Designed for coaching around your schedule',
  },
  {
    label: 'Cost',
    inPerson: '$50–150/session',
    online: '$150–200/month',
    delirio: `$${MONTHLY_PRICE_USD}/month or $${YEARLY_PRICE_USD}/year`,
  },
];

export const faqCategoryLabels: Record<FaqCategory, string> = {
  AI: 'About the AI',
  COACHING: 'About the coaching',
  PRODUCT: 'About the product',
  PRICE: 'About the price',
};

export const faqOrder: FaqCategory[] = ['AI', 'COACHING', 'PRODUCT', 'PRICE'];

export const faqItems: FaqItem[] = [
  {
    id: 'real-ai',
    category: 'AI',
    question: 'Is Delirio an AI coach or a scripted chatbot?',
    answer: 'Delirio uses AI to support conversations with Reed and Iris, each with a distinct coaching style. The experience responds to the information you provide rather than following a fixed script. Conversation context may be retained as described in the Privacy Policy.',
  },
  {
    id: 'ai-sees-form',
    category: 'AI',
    question: 'Can the AI actually see my form?',
    answer: 'Yes. Your phone camera runs real-time pose estimation to track your body during exercises. Your coach gives you feedback on what it sees — not generic tips, but corrections specific to your reps. AI feedback can be wrong and does not guarantee injury prevention.',
  },
  {
    id: 'ai-feels-weird',
    category: 'AI',
    question: 'What is it like to train with an AI coach?',
    answer: 'The experience is designed to feel clear and practical: you select a coaching style, set your context, and receive guidance through voice or text. You remain in control of when to use the service, the camera, and each session.',
  },
  {
    id: 'voice-natural',
    category: 'AI',
    question: 'How does voice coaching work?',
    answer: 'Voice sessions use your microphone to send audio to Delirio’s AI voice service. Your coach can respond based on the conversation context. You can mute, end the session, or continue in text at any time.',
  },
  {
    id: 'coach-difference',
    category: 'COACHING',
    question: 'What’s the difference between Reed and Iris?',
    answer: 'Reed is direct and structured — good if you want someone who keeps things focused and practical. Iris is expressive and energetic — good if you want someone who brings momentum. You choose the coach that fits how you like to be coached, and you can switch when you need a different style.',
  },
  {
    id: 'replace-trainer',
    category: 'COACHING',
    question: 'Can this actually replace a personal trainer?',
    answer: 'Delirio can support programming, accountability, and optional camera-based form feedback. It does not physically spot lifts, diagnose injuries, or replace the judgment of a qualified professional where that support is needed.',
  },
  {
    id: 'between-workouts',
    category: 'COACHING',
    question: 'What happens between workouts?',
    answer: 'Your coach can provide follow-ups and continue the conversation between sessions through the available messaging channels. The experience is designed to preserve useful context across your training routine.',
  },
  {
    id: 'different-fitness-app',
    category: 'COACHING',
    question: 'How is this different from a fitness app?',
    answer: 'Delirio combines AI coaching, workout programming, voice or text interaction, and optional camera-based form feedback in a single experience. The focus is coaching continuity, rather than a standalone library of content or timers.',
  },
  {
    id: 'different-online-coaching',
    category: 'COACHING',
    question: 'How is this different from online coaching?',
    answer: 'Delirio is an AI coaching service, not a human coaching relationship. It is designed to provide guidance through voice, text, programming, and optional camera-based feedback without requiring scheduled appointments.',
  },
  {
    id: 'workout-frequency',
    category: 'COACHING',
    question: 'Do I need to work out every day for this to be worth it?',
    answer: 'No. Your training plan can be tailored to the time and frequency you have available. Delirio is intended to support consistency across different routines and schedules.',
  },
  {
    id: 'push-too-hard',
    category: 'COACHING',
    question: 'Will my coach push me too hard?',
    answer: 'Your coach adapts to you, not the other way around. If you’re consistent and progressing, they’ll push you. If you’re recovering or having a rough week, they’ll meet you there. Stop exercising if something feels painful or unsafe; AI guidance is not medical advice.',
  },
  {
    id: 'change-program',
    category: 'COACHING',
    question: 'Can my coach change my program mid-week if something comes up?',
    answer: 'You can share changes in availability, travel, recovery, or training time with your coach. Delirio can use that context to suggest adjustments to the session or plan.',
  },
  {
    id: 'outside-workouts',
    category: 'COACHING',
    question: 'Can I talk to my coach about stuff outside of workouts?',
    answer: 'Delirio is a fitness coaching product, not a therapist or medical provider. You may share relevant training context, such as travel or schedule changes, to help guide your fitness plan.',
  },
  {
    id: 'message-channels',
    category: 'PRODUCT',
    question: 'Can I text my coach or do I have to use the app?',
    answer: 'Both. You can message your coach through the app, over SMS, or on WhatsApp. Same coach, same conversation, whatever is convenient.',
  },
  {
    id: 'gym-or-home',
    category: 'PRODUCT',
    question: 'Does this work at a gym or only at home?',
    answer: 'Both. You need your phone camera visible while you train and enough space to move. That works in a living room, garage, park, or gym floor.',
  },
  {
    id: 'equipment',
    category: 'PRODUCT',
    question: 'Do I need special equipment?',
    answer: 'No. You need your phone and enough space to move. Your coach programs around whatever you have access to — bodyweight at home, a full gym, or a hotel room with nothing.',
  },
  {
    id: 'camera-optional',
    category: 'PRODUCT',
    question: 'Do I have to use the camera every time?',
    answer: 'No. The camera gives your coach eyes on your form, so it’s better when you use it. You can still text, voice chat, and follow your program without it. When enabled, short video segments and pose data may be processed and stored in the cloud as described in our Privacy Policy.',
  },
  {
    id: 'workout-types',
    category: 'PRODUCT',
    question: 'What kind of workouts can I do?',
    answer: 'Strength training is the core focus. Your coach builds your splits, programs your progression, and watches your form through your camera. Walks, runs, and mobility work can fit alongside your strength plan.',
  },
  {
    id: 'workout-length',
    category: 'PRODUCT',
    question: 'How long are the workouts?',
    answer: 'That depends on you. Your coach builds around the time you have. If you have 30 minutes, you get a 30-minute session. If you have an hour, you get an hour. No filler.',
  },
  {
    id: 'existing-plan',
    category: 'PRODUCT',
    question: 'What if I already have a workout plan?',
    answer: 'Your coach can work with it or build you a new one. Either way, the value isn’t just the plan — it’s having someone watching your form and keeping you accountable to whatever plan you follow.',
  },
  {
    id: 'beginner',
    category: 'PRODUCT',
    question: 'What if I’m a complete beginner?',
    answer: 'Delirio can support beginners with structured programming, movement guidance, and optional camera-based feedback. Start conservatively, use sound judgment, and stop exercising if something feels painful or unsafe.',
  },
  {
    id: 'experienced',
    category: 'PRODUCT',
    question: 'What if I already know what I’m doing?',
    answer: 'Experienced lifters can use Delirio for programming continuity, accountability, and optional camera-based feedback. The service is designed to complement an established training routine.',
  },
  {
    id: 'switch-coach',
    category: 'PRODUCT',
    question: 'What if I don’t like my coach?',
    answer: 'You can switch. Give it a few sessions if you can — the coaching gets more personal as your coach learns how you train, what motivates you, and what your patterns are.',
  },
  {
    id: 'returning',
    category: 'PRODUCT',
    question: 'What happens if I stop for a while and come back?',
    answer: 'When available, conversation history, summaries, and preferences can help preserve context when you return. See the Privacy Policy for details on information storage and controls.',
  },
  {
    id: 'human-trainer',
    category: 'PRODUCT',
    question: 'Can I use this alongside a human trainer?',
    answer: 'Yes. Delirio can complement a human trainer by supporting your independent sessions and helping you maintain continuity between appointments.',
  },
  {
    id: 'data-private',
    category: 'PRODUCT',
    question: 'Is my data private?',
    answer: 'Your workout data, video, and conversations are not sold. Delirio shares data with service providers that process it on our behalf, including AI services for voice, text, and camera features. See the Privacy Policy for the full details and controls.',
  },
  {
    id: 'why-different',
    category: 'PRODUCT',
    question: 'I’ve tried a bunch of stuff and nothing sticks. Why would this be different?',
    answer: 'Delirio is designed to add continuity to a training plan through coaching interactions, programming, and progress context. Results depend on many individual factors, including consistent training, recovery, and personal circumstances.',
  },
  {
    id: 'weight-loss',
    category: 'PRODUCT',
    question: 'Does this work for weight loss specifically?',
    answer: 'Delirio can support fitness programming aligned with weight-management goals. It does not provide medical, nutritional, or clinical advice; consult an appropriately qualified professional for those needs.',
  },
  {
    id: 'pricing-value',
    category: 'PRICE',
    question: `Why pay $${MONTHLY_PRICE_USD}/month?`,
    answer: `A single trainer session can cost $50–150. Delirio is $${MONTHLY_PRICE_USD} billed monthly, or $${YEARLY_PRICE_USD} billed yearly — equivalent to $${YEARLY_MONTHLY_EQUIVALENT_USD} per month — for ongoing access to your AI coach, programming, form feedback, and conversation between sessions.`,
  },
  {
    id: 'cancel-anytime',
    category: 'PRICE',
    question: 'Can I cancel anytime?',
    answer: 'Subscriptions are purchased and managed through Apple’s App Store. Apple’s applicable subscription and cancellation terms govern your purchase.',
  },
];
