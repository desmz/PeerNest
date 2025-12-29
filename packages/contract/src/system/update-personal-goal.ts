import z from 'zod';

import { TApiMethod } from '../types';
import { personalGoalIdSchema, zNonEmptyString } from '../utils';

import { personalGoalSchema } from './get-personal-goals';

export const UPDATE_PERSONAL_GOAL_METHOD: TApiMethod = 'put';

export const UPDATE_PERSONAL_GOAL_URL = '/sys/personal-goals/{personalGoalId}';

export const updatePersonalGoalParamsSchema = z.object({
  personalGoalId: personalGoalIdSchema(),
});

export type TUpdatePersonalGoalParams = z.infer<typeof updatePersonalGoalParamsSchema>;

export const updatePersonalGoalFields = {
  personalGoalTitle: 'Personal Goal Title',
} as const;

export const updatePersonalGoalRoSchema = z.object({
  personalGoalTitle: zNonEmptyString(updatePersonalGoalFields.personalGoalTitle),
});

export type TUpdatePersonalGoalRo = z.infer<typeof updatePersonalGoalRoSchema>;

export const updatePersonalGoalVoSchema = personalGoalSchema;

export type TUpdatePersonalGoalVo = z.infer<typeof updatePersonalGoalVoSchema>;
