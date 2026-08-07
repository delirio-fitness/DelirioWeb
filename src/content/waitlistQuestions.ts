/**
 * The questions that stand between a visitor and the waitlist email box.
 *
 * They exist to filter and to segment: someone who will not spend a minute
 * answering is not a signal worth counting when the point of the waitlist is to
 * size real demand, and `weightProgress` is what makes the rest of the answers
 * legible against the audience the ads are aimed at.
 *
 * The six choice questions gate the email. The open question does not — it is
 * asked alongside the email box, where skipping it costs nothing, because a
 * mandatory free-text field in front of a signup is where signups go to die.
 *
 * ## Nothing here may ask about medication, diagnosis, or treatment
 *
 * `weightProgress` replaced a question that asked where the visitor was with
 * GLP-1s, including their titration stage. **Do not bring it back, and do not
 * add anything like it.** Washington's My Health My Data Act and Nevada SB 370
 * both name *use or purchase of prescribed medication* as consumer health data
 * outright, and neither has a revenue or headcount threshold — they applied to
 * this site from the first visitor. Collecting that category requires opt-in
 * consent taken before the question is asked, plus a standalone consumer health
 * data privacy policy linked from the home page. This site has neither, so the
 * question had to go rather than the compliance apparatus get built around it.
 *
 * What is left is deliberately framed as **goals, history, and what the visitor
 * wants from a plan** — never as a description of their body. `weightProgress`
 * asks how an effort is going rather than what anyone weighs, and
 * `activityBarrier` asks what plans get wrong rather than what a body cannot do.
 * That is a weaker claim on those statutes, not an exemption from them: weight
 * still sits closer to the line than age or training history. Ask anything more
 * clinical than this and the whole regime comes back.
 *
 * The test to apply to a new question or option: **could the answer be read as a
 * statement about this person's physical or mental state?** If yes, rewrite it
 * to be about the plan, the schedule, or the goal instead. That is what saved
 * the barrier question, and it cost almost nothing in signal.
 *
 * Stored records are self-describing: each entry in `responses` carries its own
 * `id` and question text, so a reader can tell an older document — one with a
 * `glp1Stage` or `body_capacity` entry — from a later one without a schema
 * version to branch on.
 */
export type WaitlistQuestionId =
  | 'age'
  | 'gender'
  | 'weightProgress'
  | 'activeMotivation'
  | 'workoutHistory'
  | 'activityBarrier';

export type WaitlistChoice = { label: string; value: string };

export type WaitlistQuestion = {
  id: WaitlistQuestionId;
  /** Shown as the screen heading in `steps` and the block heading in `single`. */
  prompt: string;
  /** Small print under the prompt. Used where the answer is sensitive. */
  note?: string;
  options: readonly WaitlistChoice[];
};

export const WAITLIST_QUESTIONS: readonly WaitlistQuestion[] = [
  {
    id: 'age',
    prompt: 'How old are you?',
    options: [
      { label: '18–24', value: '18_24' },
      { label: '25–34', value: '25_34' },
      { label: '35–44', value: '35_44' },
      { label: '45–54', value: '45_54' },
      { label: '55–64', value: '55_64' },
      { label: '65 or older', value: '65_plus' },
    ],
  },
  {
    id: 'gender',
    prompt: 'How do you describe yourself?',
    options: [
      { label: 'Woman', value: 'woman' },
      { label: 'Man', value: 'man' },
      { label: 'Non-binary', value: 'non_binary' },
      { label: 'Prefer not to say', value: 'prefer_not_to_say' },
    ],
  },
  {
    id: 'weightProgress',
    // Asks how it is going, not what the visitor weighs or what they are doing
    // about it. The cohorts worth telling apart — stalled, maintaining, regained
    // — are the ones that need different coaching and different ad copy, and all
    // three can be named without a number, a method, or a medication.
    prompt: 'If you’re trying to lose weight, how is it going?',
    note: 'Optional context, saved with your answers. Choose “Not what I’m focused on” if you would rather not say.',
    options: [
      { label: 'Not what I’m focused on', value: 'not_focused' },
      { label: 'Just getting started', value: 'starting' },
      { label: 'Going well so far', value: 'going_well' },
      { label: 'Progress has stalled', value: 'stalled' },
      { label: 'I’ve lost it and want to keep it off', value: 'maintaining' },
      { label: 'I lost it, then some came back', value: 'regained' },
    ],
  },
  {
    id: 'activeMotivation',
    prompt: 'What makes you want to stay active?',
    options: [
      { label: 'Maintaining and building muscle', value: 'build_muscle' },
      { label: 'Staying strong as I age', value: 'strong_with_age' },
      { label: 'I lost weight but feel soft', value: 'feel_soft' },
      { label: 'Getting my progress moving again', value: 'restart_progress' },
      { label: 'Keeping weight off', value: 'keep_weight_off' },
      { label: 'Building better habits', value: 'better_habits' },
    ],
  },
  {
    id: 'workoutHistory',
    prompt: 'Have you trained before?',
    options: [
      { label: 'Never lifted', value: 'never' },
      { label: 'Not in years', value: 'lapsed' },
      { label: 'Occasionally', value: 'occasional' },
      { label: 'Regularly', value: 'regular' },
    ],
  },
  {
    id: 'activityBarrier',
    prompt: 'What gets in the way of staying active?',
    options: [
      // Was "Some days my body just can’t" (`body_capacity`), which asked the
      // visitor to report their own physical state — the one option left in the
      // set that read as a symptom. This asks about the plans instead. The
      // product signal barely changes, since "I need something that adapts" is
      // what both answers were really saying, but nobody has to describe their
      // body to give it.
      { label: 'Most plans ask more than I can give', value: 'plans_too_demanding' },
      { label: 'I can’t find the time', value: 'time' },
      { label: 'I am afraid of being judged', value: 'judgement' },
      { label: 'I lose motivation when I don’t see results', value: 'no_visible_results' },
      { label: 'I am afraid I’ll injure myself', value: 'injury_fear' },
      { label: 'Nothing', value: 'nothing' },
    ],
  },
];

/**
 * Asked next to the email box rather than in front of it. Optional by design:
 * it is the most revealing answer in the set and the most expensive to give, so
 * it is placed where refusing costs the signup nothing.
 */
export const WAITLIST_OPEN_QUESTION = {
  id: 'ninetyDayWin',
  prompt: 'What would make this feel like a win 90 days from now?',
  placeholder: 'Optional — a sentence is plenty.',
} as const;

export type WaitlistAnswers = Partial<Record<WaitlistQuestionId, string>> & {
  /** The free-text answer. Never gates anything. */
  openResponse?: string;
};

/** A question answered, stored so the record reads without the question bank. */
export type WaitlistResponse = {
  id: string;
  kind: 'choice' | 'text';
  question: string;
  answer: string;
  /** The stable slug. Absent for free text, which has no fixed vocabulary. */
  value?: string;
};

/** Whether the email box has been earned. Free text is deliberately excluded. */
export function isComplete(answers: WaitlistAnswers): boolean {
  return WAITLIST_QUESTIONS.every((question) => Boolean(answers[question.id]));
}

export function answeredCount(answers: WaitlistAnswers): number {
  return WAITLIST_QUESTIONS.filter((question) => Boolean(answers[question.id])).length;
}

/**
 * Flattens answers into the stored shape. Both the prompt and the chosen label
 * are written out so a record stays readable after the copy above is rewritten.
 */
export function toResponses(answers: WaitlistAnswers): WaitlistResponse[] {
  const choices = WAITLIST_QUESTIONS.flatMap<WaitlistResponse>((question) => {
    const value = answers[question.id];
    const choice = question.options.find((option) => option.value === value);
    if (!value || !choice) return [];
    return [{ id: question.id, kind: 'choice', question: question.prompt, answer: choice.label, value }];
  });

  const openResponse = answers.openResponse?.trim();
  if (!openResponse) return choices;

  return [
    ...choices,
    {
      id: WAITLIST_OPEN_QUESTION.id,
      kind: 'text',
      question: WAITLIST_OPEN_QUESTION.prompt,
      answer: openResponse,
    },
  ];
}
