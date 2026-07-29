import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { getBrowserFeedbackId } from '../../utils/browserFeedbackId';
import { submitFeedbackToFirestore, type FeedbackAnswers } from '../../services/feedbackSubmission';
import { WishlistSignup } from './WishlistSignup';

type QuestionId =
  | 'glp1Context'
  | 'glp1Phase'
  | 'glp1Friction'
  | 'glp1Concern'
  | 'routineDisruption'
  | 'trainingPattern'
  | 'momentumBarrier'
  | 'restartFriction'
  | 'guidanceHistory'
  | 'guidanceFailure'
  | 'coachingHesitation'
  | 'unsupportedMoment'
  | 'copingResponse'
  | 'painfulConsequence';

type Choice = { label: string; value: string };
type Question = { id: QuestionId; prompt: string; options: readonly Choice[]; note?: string };
type QuestionnaireAnswers = Partial<Record<QuestionId, string>>;
type DelirioFitReason = { title: string; copy: string };

const choices = (...labels: string[]): Choice[] =>
  labels.map((label) => ({
    label,
    value: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, ''),
  }));

const glp1ContextQuestion: Question = {
  id: 'glp1Context',
  prompt: 'Is a GLP-1 medication currently part of your routine?',
  note: 'Optional. We save this answer with your questionnaire to tailor what we ask next. You can choose “Prefer not to say.”',
  options: [
    { label: 'Yes, I’m currently taking one', value: 'current' },
    { label: 'No, but I’m considering one', value: 'considering' },
    { label: 'No', value: 'no' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
  ],
};

const glp1PhaseQuestion: Question = {
  id: 'glp1Phase',
  prompt: 'Which phase feels closest to where you are now?',
  options: [
    { label: 'Actively losing weight', value: 'actively_losing' },
    { label: 'Approaching my goal or a plateau', value: 'approaching_or_plateau' },
    { label: 'Maintaining where I am', value: 'maintaining' },
    { label: 'Tapering or planning what comes after', value: 'tapering_or_after' },
  ],
};

const glp1FrictionQuestion: Question = {
  id: 'glp1Friction',
  prompt: 'Since it became part of your routine, what has made staying active hardest?',
  options: [
    { label: 'My energy feels less predictable', value: 'unpredictable_energy' },
    { label: 'I worry about losing strength or muscle', value: 'strength_or_muscle' },
    { label: 'Recovery or physical comfort gets in the way', value: 'recovery_or_comfort' },
    { label: 'Workout timing is harder to organize', value: 'workout_timing' },
  ],
};

const glp1ConcernQuestion: Question = {
  id: 'glp1Concern',
  prompt: 'If your body or routine changes, what worries you most about staying active?',
  options: [
    { label: 'Having less energy to train', value: 'lower_energy' },
    { label: 'Losing strength or muscle', value: 'strength_or_muscle' },
    { label: 'Falling out of my routine', value: 'losing_consistency' },
    { label: 'Not knowing how to adapt safely', value: 'unclear_adaptation' },
  ],
};

const routineDisruptionQuestion: Question = {
  id: 'routineDisruption',
  prompt: 'Has a change in your body, energy, or schedule ever disrupted your training?',
  options: [
    { label: 'Yes, recently', value: 'recently' },
    { label: 'Yes, more than once', value: 'repeatedly' },
    { label: 'Yes, but I eventually found my way back', value: 'recovered' },
    { label: 'Not really', value: 'not_really' },
  ],
};

const trainingPatternQuestion: Question = {
  id: 'trainingPattern',
  prompt: 'Which training pattern feels closest to your life right now?',
  options: [
    { label: 'I stay active, but planning it takes too much effort', value: 'planning_load' },
    { label: 'I start, stop, and have to rebuild momentum', value: 'on_and_off' },
    { label: 'I want to return, but it feels harder than it should', value: 'returning' },
    { label: 'I want to begin, but I do not know where to start', value: 'starting' },
  ],
};

const momentumBarrierQuestion: Question = {
  id: 'momentumBarrier',
  prompt: 'What tends to break your momentum first?',
  options: [
    { label: 'My schedule changes at the last minute', value: 'schedule_changes' },
    { label: 'My energy or strength is different that day', value: 'capacity_changes' },
    { label: 'I am not sure what workout makes sense', value: 'unclear_next_step' },
    { label: 'One missed day turns into several', value: 'missed_day_spiral' },
  ],
};

const restartFrictionQuestion: Question = {
  id: 'restartFriction',
  prompt: 'When you try to begin again, where do you usually get stuck?',
  options: [
    { label: 'The plan feels too big to begin', value: 'plan_feels_too_big' },
    { label: 'Choosing the first workout feels overwhelming', value: 'first_workout_overwhelm' },
    { label: 'No one notices if I put it off', value: 'no_accountability' },
    { label: 'I worry that I am doing it wrong', value: 'low_confidence' },
  ],
};

const guidanceHistoryQuestion: Question = {
  id: 'guidanceHistory',
  prompt: 'Has fitness guidance ever let you down?',
  options: [
    { label: 'Yes, a person or program did', value: 'person_or_program' },
    { label: 'Yes, an app or digital coach did', value: 'app_or_digital' },
    { label: 'I tried guidance, but did not stay with it', value: 'did_not_stick' },
    { label: 'I have not tried coaching', value: 'never' },
  ],
};

const guidanceFailureQuestion: Question = {
  id: 'guidanceFailure',
  prompt: 'Why did that guidance stop working for you?',
  options: [
    { label: 'It felt too generic', value: 'too_generic' },
    { label: 'It depended on a fixed schedule', value: 'fixed_schedule' },
    { label: 'It did not adapt when my body or routine changed', value: 'did_not_adapt' },
    { label: 'It disappeared once I fell behind', value: 'lost_continuity' },
  ],
};

const coachingHesitationQuestion: Question = {
  id: 'coachingHesitation',
  prompt: 'What has made coaching feel hard to try?',
  options: [
    { label: 'The cost feels too high', value: 'cost' },
    { label: 'Appointments do not fit my schedule', value: 'appointments' },
    { label: 'I do not want pressure or judgment', value: 'pressure_or_judgment' },
    { label: 'I am not sure a coach would understand my life', value: 'not_understood' },
  ],
};

const unsupportedMomentQuestion: Question = {
  id: 'unsupportedMoment',
  prompt: 'When do you feel most on your own with fitness?',
  options: choices(
    'When planning the week',
    'When I get unsure mid-workout',
    'After I miss a workout',
    'When my motivation drops',
  ),
};

const painfulConsequenceQuestion: Question = {
  id: 'painfulConsequence',
  prompt: 'Which consequence of this pattern bothers you most?',
  options: choices(
    'Losing strength or progress',
    'Wasting the limited time I have',
    'Feeling like I am always starting over',
    'Not knowing if I am doing enough',
  ),
};

function getCopingQuestion(moment?: string): Question | null {
  if (moment === 'when_planning_the_week')
    return {
      id: 'copingResponse',
      prompt: 'When your week changes, what usually happens to the workout plan?',
      options: choices(
        'It gets pushed to later',
        'I spend time rebuilding it',
        'I repeat whatever is easiest',
        'I abandon the week and restart',
      ),
    };
  if (moment === 'when_i_get_unsure_mid_workout')
    return {
      id: 'copingResponse',
      prompt: 'When you feel unsure during a workout, what usually happens?',
      options: choices(
        'I guess and keep going',
        'I stop to search for an answer',
        'I skip the movement',
        'I end the session early',
      ),
    };
  if (moment === 'after_i_miss_a_workout')
    return {
      id: 'copingResponse',
      prompt: 'After one missed workout, what usually happens next?',
      options: choices(
        'I lose my place in the plan',
        'I feel behind',
        'I wait several days to return',
        'I start the whole plan over',
      ),
    };
  if (moment === 'when_my_motivation_drops')
    return {
      id: 'copingResponse',
      prompt: 'When motivation drops, what tends to happen?',
      options: choices(
        'I wait until I feel ready again',
        'I avoid deciding what to do',
        'I start but do not finish',
        'I rely on last-minute motivation',
      ),
    };
  return null;
}

function getQuestionFlow(answers: QuestionnaireAnswers): readonly Question[] {
  const flow: Question[] = [glp1ContextQuestion];

  if (answers.glp1Context === 'current') {
    flow.push(glp1PhaseQuestion);
    if (answers.glp1Phase) flow.push(glp1FrictionQuestion);
  } else if (answers.glp1Context === 'considering') {
    flow.push(glp1ConcernQuestion);
  } else if (answers.glp1Context === 'no') {
    flow.push(routineDisruptionQuestion);
  }

  flow.push(trainingPatternQuestion);
  if (answers.trainingPattern) {
    flow.push(momentumBarrierQuestion);
    if (
      (answers.trainingPattern === 'starting' || answers.trainingPattern === 'returning') &&
      answers.momentumBarrier
    )
      flow.push(restartFrictionQuestion);
  }

  flow.push(guidanceHistoryQuestion);
  if (
    answers.guidanceHistory === 'person_or_program' ||
    answers.guidanceHistory === 'app_or_digital' ||
    answers.guidanceHistory === 'did_not_stick'
  )
    flow.push(guidanceFailureQuestion);
  else if (answers.guidanceHistory === 'never') flow.push(coachingHesitationQuestion);

  flow.push(unsupportedMomentQuestion);
  const copingQuestion = getCopingQuestion(answers.unsupportedMoment);
  if (copingQuestion) flow.push(copingQuestion);

  flow.push(painfulConsequenceQuestion);
  return flow;
}

type StoredResponse = { question: string; answer: string };

function getStoredResponses(
  answers: QuestionnaireAnswers,
  questionIds: readonly QuestionId[],
): StoredResponse[] {
  const questions = new Map(getQuestionFlow(answers).map((question) => [question.id, question]));

  return questionIds.flatMap((questionId) => {
    const selectedValue = answers[questionId];
    const question = questions.get(questionId);
    const choice = question?.options.find((option) => option.value === selectedValue);
    if (!question || !choice) return [];

    return [{ question: question.prompt, answer: choice.label }];
  });
}

function serializeAnswers(answers: QuestionnaireAnswers): FeedbackAnswers {
  return {
    wish: JSON.stringify({
      questionnaireVersion: 6,
      glp1Context: answers.glp1Context,
      glp1Phase: answers.glp1Phase,
      glp1Friction: answers.glp1Friction,
      glp1Concern: answers.glp1Concern,
      routineDisruption: answers.routineDisruption,
      responses: getStoredResponses(answers, [
        'glp1Context',
        'glp1Phase',
        'glp1Friction',
        'glp1Concern',
        'routineDisruption',
      ]),
    }),
    coachingUsefulness: JSON.stringify({
      trainingPattern: answers.trainingPattern,
      momentumBarrier: answers.momentumBarrier,
      restartFriction: answers.restartFriction,
      guidanceHistory: answers.guidanceHistory,
      guidanceFailure: answers.guidanceFailure,
      coachingHesitation: answers.coachingHesitation,
      responses: getStoredResponses(answers, [
        'trainingPattern',
        'momentumBarrier',
        'restartFriction',
        'guidanceHistory',
        'guidanceFailure',
        'coachingHesitation',
      ]),
    }),
    nextBuild: JSON.stringify({
      unsupportedMoment: answers.unsupportedMoment,
      copingResponse: answers.copingResponse,
      painfulConsequence: answers.painfulConsequence,
      responses: getStoredResponses(answers, [
        'unsupportedMoment',
        'copingResponse',
        'painfulConsequence',
      ]),
    }),
  };
}

const fitReasons: Record<string, DelirioFitReason> = {
  unpredictable_energy: {
    title: 'Training that can account for changing energy.',
    copy: 'You said unpredictable energy makes staying active harder. Delirio can adjust the workout around what you report while keeping the larger training context connected.',
  },
  lower_energy: {
    title: 'Training that can account for changing energy.',
    copy: 'You said having less energy concerns you. Delirio can adjust the next session around what you report that day.',
  },
  strength_or_muscle: {
    title: 'Strength stays visible while your body changes.',
    copy: 'You said strength or muscle matters to you. Delirio keeps resistance training visible and adapts progression around the capacity you report.',
  },
  recovery_or_comfort: {
    title: 'Recovery informs the next workout.',
    copy: 'You said recovery or comfort can get in the way. Delirio uses what you report to adjust the next session instead of forcing a plan that no longer fits.',
  },
  workout_timing: {
    title: 'Training stays practical as routines change.',
    copy: 'You said workout timing is harder to organize. Delirio prepares the schedule and can reorganize it when your day changes.',
  },
  losing_consistency: {
    title: 'Continuity when a routine changes.',
    copy: 'You said falling out of your routine concerns you. Delirio keeps the plan context connected so one disruption does not require a complete restart.',
  },
  unclear_adaptation: {
    title: 'Guidance with clear limits.',
    copy: 'You said adapting safely is a concern. Delirio explains the training next step and keeps medical decisions with your healthcare professional.',
  },
  recently: {
    title: 'A plan that meets the life you have now.',
    copy: 'You said a recent change disrupted your training. Delirio can rebuild the next step around your current time, energy, and capacity.',
  },
  repeatedly: {
    title: 'Change does not have to mean another restart.',
    copy: 'You said changes have disrupted training more than once. Delirio keeps the context and adapts the plan instead of asking you to begin from zero.',
  },
  recovered: {
    title: 'The return can take less work.',
    copy: 'You said you eventually found your way back after a disruption. Delirio keeps the next step visible and reduces the planning required to return.',
  },
  planning_load: {
    title: 'Less planning work between you and the workout.',
    copy: 'You said staying active takes too much planning. Delirio prepares the schedule and workout so less energy goes into organizing it.',
  },
  on_and_off: {
    title: 'Continuity for training that has been on and off.',
    copy: 'You described training that starts and stops. Delirio keeps the context and offers a clear next step when you are ready to continue.',
  },
  returning: {
    title: 'A guided return that respects where you are now.',
    copy: 'You said returning feels harder than it should. Delirio can rebuild the plan around your current capacity rather than treating the return like a blind restart.',
  },
  starting: {
    title: 'A clearer first step.',
    copy: 'You said you do not know where to start. Delirio can create a manageable plan and coach you through the next action.',
  },
  schedule_changes: {
    title: 'A plan built to handle schedule changes.',
    copy: 'You identified last-minute schedule changes as a barrier. Delirio is designed to reorganize the work around the time you actually have.',
  },
  capacity_changes: {
    title: 'Training that can respond to changing energy and strength.',
    copy: 'You said your energy or strength can vary. Delirio can adjust the next step around what you report that day.',
  },
  unclear_next_step: {
    title: 'Clearer guidance when the next step is uncertain.',
    copy: 'You said uncertainty gets in the way. Delirio provides a plan and stays available by voice or text when a movement or decision needs clarification.',
  },
  missed_day_spiral: {
    title: 'A lower-friction way to restart.',
    copy: 'You said one missed day can become several. Delirio remembers the training context and reconnects you with a useful next action.',
  },
  plan_feels_too_big: {
    title: 'A smaller first step with a visible finish line.',
    copy: 'You said the plan can feel too big to begin. Delirio can shape the first session around a manageable amount of work.',
  },
  first_workout_overwhelm: {
    title: 'The first workout is already decided.',
    copy: 'You said choosing the first workout feels overwhelming. Delirio prepares that next step so you do not have to rebuild the plan yourself.',
  },
  no_accountability: {
    title: 'Accountability that keeps the next commitment visible.',
    copy: 'You said no one notices if you put training off. Delirio keeps the coaching thread active and makes the next commitment easier to see.',
  },
  low_confidence: {
    title: 'Guidance designed around context and clear limits.',
    copy: 'You said uncertainty about doing it correctly gets in the way. Delirio explains the next step and stays available by voice or text when you need clarification.',
  },
  too_generic: {
    title: 'Context that goes beyond a generic recommendation.',
    copy: 'You said prior coaching felt too generic. Delirio uses the ongoing plan, workouts, and conversations to make guidance more specific.',
  },
  fixed_schedule: {
    title: 'Coaching without another calendar conflict.',
    copy: 'You said fixed scheduling made guidance stop working. Delirio can reorganize the plan without requiring another appointment.',
  },
  did_not_adapt: {
    title: 'Coaching designed to adapt as you change.',
    copy: 'You said prior guidance did not adapt when your body or routine changed. Delirio uses workouts, check-ins, and conversations to keep the plan aligned with what you report.',
  },
  lost_continuity: {
    title: 'A coaching thread that notices when momentum changes.',
    copy: 'You said guidance disappeared once you fell behind. Delirio keeps continuity and can make the next commitment visible again.',
  },
  cost: {
    title: 'Ongoing guidance without the traditional coaching price.',
    copy: 'You said cost has made coaching difficult to try. Delirio is designed to make continuous support more accessible than appointment-based coaching.',
  },
  appointments: {
    title: 'Coaching that does not add another appointment.',
    copy: 'You said appointments do not fit your schedule. Delirio is available through the app, voice, or text when you choose to use it.',
  },
  pressure_or_judgment: {
    title: 'Private support without the performance pressure.',
    copy: 'You said pressure or judgment has made coaching hard to try. Delirio gives you a private place to ask questions, pause, and return.',
  },
  not_understood: {
    title: 'One coaching thread that learns the context you share.',
    copy: 'You said you are unsure a coach would understand your life. Delirio keeps your plan, workouts, check-ins, and conversations connected over time.',
  },
  when_planning_the_week: {
    title: 'The plan can move with the week.',
    copy: 'You said planning the week can feel unsupported. Delirio prepares the plan, then reorganizes it when the week changes.',
  },
  when_i_get_unsure_mid_workout: {
    title: 'Answers inside the workout.',
    copy: 'You said uncertainty can show up mid-workout. Delirio lets you ask by voice or text without leaving the coaching thread.',
  },
  after_i_miss_a_workout: {
    title: 'A missed workout becomes an adjustment, not a verdict.',
    copy: 'You said support is most needed after a missed workout. Delirio reorganizes what comes next instead of making you start from zero.',
  },
  when_my_motivation_drops: {
    title: 'A next step that does not depend on feeling perfectly motivated.',
    copy: 'You said motivation can drop. Delirio keeps a manageable next action visible and can check in before the gap grows.',
  },
  losing_strength_or_progress: {
    title: 'Strength stays visible while you make progress.',
    copy: 'You said losing strength or progress bothers you most. Delirio keeps resistance training and your next action connected.',
  },
  wasting_the_limited_time_i_have: {
    title: 'More of your limited time goes into training.',
    copy: 'You said wasted time is the consequence that bothers you most. Delirio handles planning and keeps guidance close so less time goes into deciding, searching, and restarting.',
  },
  feeling_like_i_am_always_starting_over: {
    title: 'No unnecessary return to day one.',
    copy: 'You said always starting over bothers you most. Delirio preserves the completed work and current context when preparing the next step.',
  },
  not_knowing_if_i_am_doing_enough: {
    title: 'A clearer view of what is enough for today.',
    copy: 'You said not knowing whether you are doing enough bothers you most. Delirio gives the session a clear purpose and prepares the next step from the work you complete.',
  },
};

function getDelirioFit(answers: QuestionnaireAnswers): DelirioFitReason[] {
  const responseReason: Record<string, DelirioFitReason> = {
    it_gets_pushed_to_later: fitReasons.schedule_changes,
    i_spend_time_rebuilding_it: fitReasons.planning_load,
    i_repeat_whatever_is_easiest: fitReasons.unclear_next_step,
    i_abandon_the_week_and_restart: fitReasons.missed_day_spiral,
    i_guess_and_keep_going: fitReasons.when_i_get_unsure_mid_workout,
    i_stop_to_search_for_an_answer: fitReasons.when_i_get_unsure_mid_workout,
    i_skip_the_movement: fitReasons.unclear_next_step,
    i_end_the_session_early: fitReasons.unclear_next_step,
    i_lose_my_place_in_the_plan: fitReasons.after_i_miss_a_workout,
    i_feel_behind: fitReasons.after_i_miss_a_workout,
    i_wait_several_days_to_return: fitReasons.missed_day_spiral,
    i_start_the_whole_plan_over: fitReasons.missed_day_spiral,
    i_wait_until_i_feel_ready_again: fitReasons.when_my_motivation_drops,
    i_avoid_deciding_what_to_do: fitReasons.planning_load,
    i_start_but_do_not_finish: fitReasons.when_my_motivation_drops,
    i_rely_on_last_minute_motivation: fitReasons.when_my_motivation_drops,
  };
  const selectedValues = [
    answers.glp1Friction,
    answers.glp1Concern,
    answers.routineDisruption,
    answers.trainingPattern,
    answers.momentumBarrier,
    answers.restartFriction,
    answers.guidanceFailure,
    answers.coachingHesitation,
    answers.unsupportedMoment,
    answers.copingResponse,
    answers.painfulConsequence,
  ];
  const reasons = selectedValues
    .map((value) => responseReason[value ?? ''] ?? fitReasons[value ?? ''])
    .filter((reason): reason is DelirioFitReason => Boolean(reason));
  return reasons.filter(
    (reason, index) => reasons.findIndex(({ title }) => title === reason.title) === index,
  );
}

const ANSWER_CONFIRMATION_MS = 450;
const RESULT_REVEAL_DELAY_MS = 1000;

type FeedbackSectionProps = {
  invocationId?: number;
  open?: boolean;
  onClose?: () => void;
};

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function FeedbackSection({
  invocationId,
  open: controlledOpen,
  onClose,
}: FeedbackSectionProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const advanceTimerRef = useRef<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const ownsHistoryEntryRef = useRef(false);
  const previousInvocationRef = useRef(invocationId);
  const isOpen = controlledOpen ?? internalOpen;
  const questionFlow = getQuestionFlow(answers);
  const activeQuestion = questionFlow[step];
  const delirioFit = getDelirioFit(answers);

  const resetQuestionnaire = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
    setStep(0);
    setAnswers({});
    setStatus('idle');
    setSubmissionId(null);
    setError(null);
    setIsAdvancing(false);
  }, []);

  const closeQuestionnaire = useCallback(() => {
    if (!isOpen) return;
    if (onClose) onClose();
    else setInternalOpen(false);

    if (ownsHistoryEntryRef.current && window.history.state?.delirioQuestionnaire) {
      ownsHistoryEntryRef.current = false;
      const { delirioQuestionnaire: _questionnaireMarker, ...restoredState } = window.history.state;
      window.history.replaceState(restoredState, '', window.location.href);
    }
  }, [isOpen, onClose]);

  useEffect(
    () => () => {
      if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
    },
    [],
  );

  useLayoutEffect(() => {
    if (invocationId === undefined || invocationId === previousInvocationRef.current) return;
    previousInvocationRef.current = invocationId;
    resetQuestionnaire();
  }, [invocationId, resetQuestionnaire]);

  useEffect(() => {
    if (!isOpen) return;

    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const existingState =
      window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    window.history.pushState(
      { ...existingState, delirioQuestionnaire: true },
      '',
      window.location.href,
    );
    ownsHistoryEntryRef.current = true;

    const focusFrame = window.requestAnimationFrame(() => questionHeadingRef.current?.focus());
    const handlePopState = () => {
      if (!ownsHistoryEntryRef.current) return;
      ownsHistoryEntryRef.current = false;
      if (onClose) onClose();
      else setInternalOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeQuestionnaire();
        return;
      }
      if (event.key !== 'Tab' || !dialogRef.current) return;

      const focusableElements = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      ).filter(
        (element) =>
          !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
      );
      const first = focusableElements[0];
      const last = focusableElements.at(-1);
      if (!first || !last) {
        event.preventDefault();
        dialogRef.current.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('popstate', handlePopState);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      window.requestAnimationFrame(() => returnFocusRef.current?.focus());
    };
  }, [closeQuestionnaire, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const focusFrame = window.requestAnimationFrame(() => questionHeadingRef.current?.focus());
    return () => window.cancelAnimationFrame(focusFrame);
  }, [isOpen, status, step]);

  const submitFeedback = async (submissionAnswers: QuestionnaireAnswers) => {
    if (status === 'submitting') return;
    try {
      setError(null);
      setStatus('submitting');
      const [documentId] = await Promise.all([
        submitFeedbackToFirestore(
          getBrowserFeedbackId(),
          serializeAnswers(submissionAnswers),
        ),
        new Promise<void>((resolve) => window.setTimeout(resolve, RESULT_REVEAL_DELAY_MS)),
      ]);
      setSubmissionId(documentId);
      setStatus('success');
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to submit feedback right now.',
      );
      setStatus('idle');
    }
  };

  const selectAnswer = (questionId: QuestionId, option: Choice) => {
    if (status === 'submitting' || isAdvancing) return;

    const proposedAnswers = { ...answers, [questionId]: option.value };
    const nextFlow = getQuestionFlow(proposedAnswers);
    const validQuestionIds = new Set(nextFlow.map((question) => question.id));
    const nextAnswers = Object.fromEntries(
      Object.entries(proposedAnswers).filter(([id]) => validQuestionIds.has(id as QuestionId)),
    ) as QuestionnaireAnswers;

    setAnswers(nextAnswers);
    setError(null);

    if (step >= nextFlow.length - 1) {
      setIsAdvancing(false);
      void submitFeedback(nextAnswers);
      return;
    }

    setIsAdvancing(true);

    advanceTimerRef.current = window.setTimeout(() => {
      setIsAdvancing(false);
      advanceTimerRef.current = null;
      setStep((current) => current + 1);
    }, ANSWER_CONFIRMATION_MS);
  };

  const maxReasonsToRender = 3;
  const questionnaire = isOpen ? (
    <div
      className="d3-questionnaire-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeQuestionnaire();
      }}
    >
      <div
        ref={dialogRef}
        className="d3-questionnaire"
        role="dialog"
        aria-modal="true"
        aria-labelledby="questionnaire-question"
        tabIndex={-1}
      >
        <div className="d3-questionnaire-header">
          {status === 'idle' && step > 0 && (
            <button
              className="d3-questionnaire-back"
              type="button"
              disabled={isAdvancing}
              onClick={() => {
                setStep((current) => current - 1);
                setError(null);
              }}
            >
              ← BACK
            </button>
          )}
          {status === 'idle' && (
            <div
              className="d3-questionnaire-progress"
              role="progressbar"
              aria-label={`Question ${step + 1} of ${questionFlow.length}`}
              aria-valuemin={1}
              aria-valuemax={questionFlow.length}
              aria-valuenow={step + 1}
            >
              <i>
                <b style={{ width: `${((step + 1) / questionFlow.length) * 100}%` }} />
              </i>
            </div>
          )}
          <button
            className="d3-questionnaire-close"
            type="button"
            aria-label="Close questionnaire"
            onClick={closeQuestionnaire}
          >
            <X aria-hidden="true" />
          </button>
        </div>

        {status === 'success' ? (
          <div className="d3-questionnaire-success" role="status">
            <div className="d3-questionnaire-fit">
              <p>BASED ONLY ON YOUR ANSWERS</p>
              <h2 ref={questionHeadingRef} id="questionnaire-question" tabIndex={-1}>
                HERE IS HOW DELIRIO CAN HELP YOU
              </h2>
              <ul aria-label="Why Delirio fits you">
                {delirioFit.slice(0, maxReasonsToRender).map((reason) => (
                  <li key={reason.title}>
                    <strong>{reason.title}</strong>
                    <span>{reason.copy}</span>
                  </li>
                ))}
              </ul>
            </div>
            <WishlistSignup
              placement="questionnaire"
              questionnaire={
                submissionId ? { answers: serializeAnswers(answers), submissionId } : undefined
              }
            />
          </div>
        ) : status === 'submitting' ? (
          <div className="d3-questionnaire-loading" role="status" aria-live="polite">
            <span className="d3-questionnaire-loading-icon" aria-hidden="true" />
            <h2 style = {{
              fontSize: "1.5rem",
            }} ref={questionHeadingRef} id="questionnaire-question" tabIndex={-1}>
              Consulting the committee about what will work for you.
            </h2>
          </div>
        ) : (
          <div className="d3-questionnaire-form">
            <div className="d3-questionnaire-step">
              <h2 ref={questionHeadingRef} id="questionnaire-question" tabIndex={-1}>
                {activeQuestion.prompt}
              </h2>
              {activeQuestion.note && (
                <p className="d3-questionnaire-note" id="questionnaire-note">
                  {activeQuestion.note}
                </p>
              )}
              <fieldset
                className="d3-questionnaire-options"
                aria-labelledby="questionnaire-question"
                aria-describedby={activeQuestion.note ? 'questionnaire-note' : undefined}
              >
                {activeQuestion.options.map((option) => (
                  <label key={option.value}>
                    <input
                      type="radio"
                      name={activeQuestion.id}
                      value={option.value}
                      checked={answers[activeQuestion.id] === option.value}
                      disabled={isAdvancing}
                      onClick={() => {
                        if (answers[activeQuestion.id] === option.value) {
                          selectAnswer(activeQuestion.id, option);
                        }
                      }}
                      onChange={() => selectAnswer(activeQuestion.id, option)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </fieldset>

              {error && (
                <p className="d3-questionnaire-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  ) : null;

  return questionnaire ? createPortal(questionnaire, document.body) : null;
}
