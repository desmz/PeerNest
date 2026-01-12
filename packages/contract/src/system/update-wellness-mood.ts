import z from 'zod';

import { TApiMethod } from '../types';
import { wellnessMoodIdSchema, zNonEmptyString } from '../utils';

import { wellnessMoodSchema } from './get-wellness-moods';

export const UPDATE_WELLNESS_MOOD_METHOD: TApiMethod = 'put';

export const UPDATE_WELLNESS_MOOD_URL = '/sys/wellness-moods/{wellnessMoodId}';

export const updateWellnessMoodParamsSchema = z.object({
  wellnessMoodId: wellnessMoodIdSchema(),
});

export type TUpdateWellnessMoodParams = z.infer<typeof updateWellnessMoodParamsSchema>;

export const updateWellnessMoodFields = {
  wellnessMoodName: 'Wellness Mood Name',
} as const;

export const updateWellnessMoodRoSchema = z.object({
  wellnessMoodName: zNonEmptyString(updateWellnessMoodFields.wellnessMoodName),
});

export type TUpdateWellnessMoodRo = z.infer<typeof updateWellnessMoodRoSchema>;

export const updateWellnessMoodVoSchema = wellnessMoodSchema;

export type TUpdateWellnessMoodVo = z.infer<typeof updateWellnessMoodVoSchema>;
