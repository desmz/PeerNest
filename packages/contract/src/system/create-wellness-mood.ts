import z from 'zod';

import { TApiMethod } from '../types';
import { zNonEmptyString } from '../utils';

import { wellnessMoodSchema } from './get-wellness-moods';

export const CREATE_WELLNESS_MOOD_METHOD: TApiMethod = 'post';

export const CREATE_WELLNESS_MOOD_URL = '/sys/wellness-moods';

export const createWellnessMoodFields = {
  wellnessMoodName: 'WellnessMood Name',
} as const;

export const createWellnessMoodRoSchema = z.object({
  wellnessMoodName: zNonEmptyString(createWellnessMoodFields.wellnessMoodName),
});

export type TCreateWellnessMoodRo = z.infer<typeof createWellnessMoodRoSchema>;

export const createWellnessMoodVoSchema = wellnessMoodSchema;

export type TCreateWellnessMoodVo = z.infer<typeof createWellnessMoodVoSchema>;
