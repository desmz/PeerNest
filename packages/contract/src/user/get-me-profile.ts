import z from 'zod';

import { displayNameSchema } from '../auth';
import {
  domainSchema,
  getInterestsVoSchema,
  getPersonalGoalsVoSchema,
  pronounSchema,
  universitySchema,
} from '../system';

export const GET_ME_PROFILE = '/me/profile';

export const getMeProfileVoSchema = z.object({
  userDisplayName: displayNameSchema,
  pronoun: pronounSchema.nullable(),
  university: universitySchema.nullable(),
  domain: domainSchema.nullable(),
  userInfoBio: z.string().nullable(),
  userInfoLookingFor: z.string().nullable(),
  interests: getInterestsVoSchema.nullable(),
  personalGoals: getPersonalGoalsVoSchema.nullable(),
});

export type TGetMeProfileVo = z.infer<typeof getMeProfileVoSchema>;
