export type SeoPage = {
  path: string;
  eyebrow: string;
  title: string;
  introduction: string;
  sections: { heading: string; paragraphs: string[] }[];
};

export const seoPages: SeoPage[] = [
  {
    path: '/ai-fitness-coach',
    eyebrow: 'DELIRIO EXPLAINED',
    title: 'AN AI FITNESS COACH FOR THE WAY REAL WEEKS CHANGE.',
    introduction: 'Delirio helps turn the training context you choose to share—your plan, schedule, equipment, and recent sessions—into a clearer next workout. It is designed for strength training support, not medical diagnosis or emergency guidance.',
    sections: [
      { heading: 'WHAT AN AI FITNESS COACH CAN HELP WITH', paragraphs: ['A useful coaching tool should reduce the small decisions that make a routine harder to sustain. Delirio can help structure a plan, explain the next session, support reflection, and adapt suggestions when your available time or equipment changes.', 'You decide what to follow, change, or skip. Delirio does not physically spot you, diagnose pain or injury, or replace a qualified health professional.'] },
      { heading: 'COACHING THAT FITS YOUR CONTEXT', paragraphs: ['A plan is more useful when it accounts for the conditions around it. If a gym visit becomes a home workout, a long session becomes a short one, or your schedule shifts, you can use that context to make the next step more realistic.', 'Delirio offers two coaching styles: Reed is direct and structured; Iris is attentive and encouraging. You can choose the style that helps you stay clear and supported.'] },
    ],
  },
  {
    path: '/adaptive-workout-planner',
    eyebrow: 'ADAPTIVE TRAINING',
    title: 'A WORKOUT PLAN SHOULD MOVE WITH YOUR WEEK.',
    introduction: 'An adaptive workout planner makes room for the practical constraints that change a training week: time, equipment, recovery, travel, and a missed session. Delirio is built to help make the next session clear without asking you to rebuild everything from scratch.',
    sections: [
      { heading: 'START WITH THE SESSION YOU CAN ACTUALLY DO', paragraphs: ['A training plan is a starting point, not a test you fail when life gets busy. Delirio can help you work from the time and equipment you have available, so a shorter or different session still has a purposeful place in your week.', 'The goal is not to promise a perfect program. It is to make returning to training feel more concrete and less overwhelming.'] },
      { heading: 'KEEP THE THREAD BETWEEN SESSIONS', paragraphs: ['Planning is more than choosing exercises once. Your recent workout, available equipment, and feedback can inform what comes next. Delirio helps keep that context together so you spend less time reconstructing where you left off.', 'For pain, injury, medication, or nutrition decisions, follow guidance from an appropriate qualified clinician.'] },
    ],
  },
  {
    path: '/voice-workout-coach',
    eyebrow: 'VOICE OR TEXT',
    title: 'WORKOUT GUIDANCE IN THE FORMAT THAT FITS THE MOMENT.',
    introduction: 'Some sessions call for a quick text check-in; others are easier with live voice guidance. Delirio supports conversation around your workout context, while keeping you in control of microphone access and your training decisions.',
    sections: [
      { heading: 'GUIDANCE DURING A SESSION', paragraphs: ['Voice or text can make a session feel easier to navigate when you want a clearer next step, need a reminder of the plan, or want to adjust around the time you have. You can pause or end a conversation whenever you choose.', 'A coaching response is guidance, not a command. Stop when something does not feel right and seek qualified help for pain, injury, or medical concerns.'] },
      { heading: 'CONTEXT, NOT A SCRIPT', paragraphs: ['Delirio is designed to use available training context rather than select from a fixed script. AI can still misunderstand or make mistakes, so the right way to use it is as a flexible support tool—not an authority that overrides your judgment.'] },
    ],
  },
  {
    path: '/workout-form-feedback',
    eyebrow: 'SUPPORTED CAMERA FEEDBACK',
    title: 'CAMERA-BASED FORM FEEDBACK, WITH CLEAR LIMITS.',
    introduction: 'For supported movements, Delirio can use pose estimation and visible movement details to provide workout form feedback. That feedback is limited by the camera angle, lighting, clothing, and whether your full body is visible.',
    sections: [
      { heading: 'WHAT THE CAMERA CAN AND CANNOT SEE', paragraphs: ['Camera feedback can add useful context for supported movements when the setup is clear. It cannot assess every movement detail, diagnose an injury, or determine whether an exercise is safe for your body.', 'You remain responsible for choosing a suitable load, stopping when something hurts, and consulting a qualified professional about pain, injury, or medical conditions.'] },
      { heading: 'YOU CONTROL CAMERA ACCESS', paragraphs: ['Camera access is optional. You can follow a plan and use voice or text guidance without it. When you use the camera, give the feature a clear view and treat its feedback as one input into your own judgment.'] },
    ],
  },
];

export function getSeoPage(pathname: string): SeoPage | undefined {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  return seoPages.find((page) => page.path === normalizedPath);
}
