import z from 'zod';

import { displayNameSchema } from '../auth';
import {
  domainSchema,
  getInterestsVoSchema,
  getPersonalGoalsVoSchema,
  pronounSchema,
  universitySchema,
} from '../system';
import { interestIdSchema, personalGoalIdSchema, userIdSchema, zNonEmptyString } from '../utils';

export const FIND_USERS_URL = '/users';

export const findUsersQueryParams = {
  q: 'Query param',
  interestIds: 'Interest Ids param',
  goalIds: 'Goal Ids param',
  limit: 'Limit param',
  offset: 'Offset param',
} as const;

export const findUsersQueryParamsSchema = z.object({
  q: zNonEmptyString(findUsersQueryParams.q)
    .transform((val) => val?.trim())
    .nullish(),
  interestIds: z.array(interestIdSchema()).nullish(),
  goalIds: z.array(personalGoalIdSchema()).nullish(),
  limit: z.int().positive().nullish(),
  offset: z.int().positive().nullish(),
});

export type TFindUsersQueryParams = z.infer<typeof findUsersQueryParamsSchema>;

export const findUserSchema = z.object({
  userId: userIdSchema(),
  userDisplayName: displayNameSchema,
  userAvatarUrl: z.string().nonempty(),
  roleName: z.string().nonempty().nullable(),
  pronoun: pronounSchema.nullable(),
  university: universitySchema.nullable(),
  domain: domainSchema.nullable(),
  userInfoLookingFor: z.string().nullable(),
  interests: getInterestsVoSchema.nullable(),
  personalGoals: getPersonalGoalsVoSchema.nullable(),
});

export const findUsersVoSchema = z.object({
  count: z.int(),
  users: z.array(findUserSchema),
});

export type TFindUsersVo = z.infer<typeof findUsersVoSchema>;
