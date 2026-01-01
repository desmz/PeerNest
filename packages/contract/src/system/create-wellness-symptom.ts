import z from 'zod';

import { TApiMethod } from '../types';
import { wellnessSymptomCategoryIdSchema, zNonEmptyString } from '../utils';

import { wellnessSymptomCategorySchema, wellnessSymptomSchema } from './get-wellness-symptoms';

export const CREATE_WELLNESS_SYMPTOM_METHOD: TApiMethod = 'post';

export const CREATE_WELLNESS_SYMPTOM_URL = '/sys/wellness-symptoms';

export const createWellnessSymptomFields = {
  wellnessSymptomName: 'Wellness Symptom Name',
  wellnessSymptomWellnessSymptomCategoryId: 'Wellness Symptom Category Id',
} as const;

export const createWellnessSymptomRoSchema = z.object({
  wellnessSymptomName: zNonEmptyString(createWellnessSymptomFields.wellnessSymptomName),
  wellnessSymptomWellnessSymptomCategoryId: wellnessSymptomCategoryIdSchema(),
});

export type TCreateWellnessSymptomRo = z.infer<typeof createWellnessSymptomRoSchema>;

export const createWellnessSymptomVoSchema = wellnessSymptomSchema.extend({
  wellnessSymptomCategory: wellnessSymptomCategorySchema,
});

export type TCreateWellnessSymptomVo = z.infer<typeof createWellnessSymptomVoSchema>;
