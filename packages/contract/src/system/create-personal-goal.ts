import z from 'zod';

import { TApiMethod } from '../types';
import { zNonEmptyString } from '../utils';

import { personalGoalSchema } from './get-personal-goals';

export const CREATE_PERSONAL_GOAL_METHOD: TApiMethod = 'post';

export const CREATE_PERSONAL_GOAL_URL = '/sys/personal-goals';

export const createPersonalGoalFields = {
  personalGoalTitle: 'Personal Goal Title',
} as const;

export const createPersonalGoalRoSchema = z.object({
  personalGoalTitle: zNonEmptyString(createPersonalGoalFields.personalGoalTitle),
});

export type TCreatePersonalGoalRo = z.infer<typeof createPersonalGoalRoSchema>;

export const createPersonalGoalVoSchema = personalGoalSchema;

export type TCreatePersonalGoalVo = z.infer<typeof createPersonalGoalVoSchema>;
