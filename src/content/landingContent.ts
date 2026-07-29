import irisAvatar from '../images/emojis/Iris/Iris_idle_return.png';
import reedAvatar from '../images/emojis/Reed/Reed_idle_return.png';

export type CoachId = 'reed' | 'iris';

export interface CoachProfile {
  id: CoachId;
  name: string;
  avatar: string;
}

/** Shared coach identity used by the session studio and confirmation dialog. */
export const coachProfiles: Record<CoachId, CoachProfile> = {
  reed: {
    id: 'reed',
    name: 'Reed',
    avatar: reedAvatar,
  },
  iris: {
    id: 'iris',
    name: 'Iris',
    avatar: irisAvatar,
  },
};
