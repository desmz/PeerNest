import z from 'zod';

import { TApiMethod } from '../types';
import { wellnessFactorCategoryIdSchema, zNonEmptyString } from '../utils';

import { wellnessFactorCategorySchema, wellnessFactorSchema } from './get-wellness-factors';

export const CREATE_WELLNESS_FACTOR_METHOD: TApiMethod = 'post';

export const CREATE_WELLNESS_FACTOR_URL = '/sys/wellness-factors';

export const createWellnessFactorFields = {
  wellnessFactorName: 'Wellness Factor Name',
  wellnessFactorWellnessFactorCategoryId: 'Wellness Factor Category Id',
} as const;

export const createWellnessFactorRoSchema = z.object({
  wellnessFactorName: zNonEmptyString(createWellnessFactorFields.wellnessFactorName),
  wellnessFactorWellnessFactorCategoryId: wellnessFactorCategoryIdSchema(),
});

export type TCreateWellnessFactorRo = z.infer<typeof createWellnessFactorRoSchema>;

export const createWellnessFactorVoSchema = wellnessFactorSchema.extend({
  wellnessFactorCategory: wellnessFactorCategorySchema,
});

export type TCreateWellnessFactorVo = z.infer<typeof createWellnessFactorVoSchema>;
