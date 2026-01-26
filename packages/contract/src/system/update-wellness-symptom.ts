import z from 'zod';

import { TApiMethod } from '../types';
import { wellnessSymptomIdSchema, zNonEmptyString } from '../utils';

import { wellnessSymptomCategorySchema, wellnessSymptomSchema } from './get-wellness-symptoms';

export const UPDATE_WELLNESS_SYMPTOM_METHOD: TApiMethod = 'put';

export const UPDATE_WELLNESS_SYMPTOM_URL = '/sys/wellness-symptoms/{wellnessSymptomId}';

export const updateWellnessSymptomParamsSchema = z.object({
  wellnessSymptomId: wellnessSymptomIdSchema(),
});

export type TUpdateWellnessSymptomParams = z.infer<typeof updateWellnessSymptomParamsSchema>;

export const updateWellnessSymptomFields = {
  wellnessSymptomName: 'Wellness Symptom Name',
} as const;

export const updateWellnessSymptomRoSchema = z.object({
  wellnessSymptomName: zNonEmptyString(updateWellnessSymptomFields.wellnessSymptomName),
});

export type TUpdateWellnessSymptomRo = z.infer<typeof updateWellnessSymptomRoSchema>;

export const updateWellnessSymptomVoSchema = wellnessSymptomSchema.extend({
  wellnessSymptomCategory: wellnessSymptomCategorySchema,
});

export type TUpdateWellnessSymptomVo = z.infer<typeof updateWellnessSymptomVoSchema>;
