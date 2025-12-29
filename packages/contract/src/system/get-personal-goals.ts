import z from 'zod';

import { TApiMethod } from '../types';

export const GET_PERSONAL_GOALS_METHOD: TApiMethod = 'get';

export const GET_PERSONAL_GOALS_URL = '/sys/personal-goals';

export const getPersonalGoalsVoSchema = z.array(
  z.object({
    personalGoalId: z.string(),
    personalGoalTitle: z.string(),
    personalGoalName: z.string(),
    personalGoalDescription: z.string().nullable(),
    personalGoalPosition: z.string(),
  })
);

export type TGetPersonalGoalsVo = z.infer<typeof getPersonalGoalsVoSchema>;
