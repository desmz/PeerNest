import z from 'zod';

import { TApiMethod } from '../types';
import { wellnessFactorIdSchema, zNonEmptyString } from '../utils';

import { wellnessFactorCategorySchema, wellnessFactorSchema } from './get-wellness-factors';

export const UPDATE_WELLNESS_FACTOR_METHOD: TApiMethod = 'put';

export const UPDATE_WELLNESS_FACTOR_URL = '/sys/wellness-factor/{wellnessFactorId}';

export const updateWellnessFactorParamsSchema = z.object({
  wellnessFactorId: wellnessFactorIdSchema(),
});

export type TUpdateWellnessFactorParams = z.infer<typeof updateWellnessFactorParamsSchema>;

export const updateWellnessFactorFields = {
  wellnessFactorName: 'Wellness Factor Name',
} as const;

export const updateWellnessFactorRoSchema = z.object({
  wellnessFactorName: zNonEmptyString(updateWellnessFactorFields.wellnessFactorName),
});

export type TUpdateWellnessFactorRo = z.infer<typeof updateWellnessFactorRoSchema>;

export const updateWellnessFactorVoSchema = wellnessFactorSchema.extend({
  wellnessFactorCategory: wellnessFactorCategorySchema,
});

export type TUpdateWellnessFactorVo = z.infer<typeof updateWellnessFactorVoSchema>;
