import z from 'zod';

import { TApiMethod } from '../types';

export const GET_WELLNESS_FACTORS_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_FACTORS_URL = '/sys/wellness-factors';

export const wellnessFactorSchema = z.object({
  wellnessFactorId: z.string().nonempty(),
  wellnessFactorName: z.string().nonempty(),
  wellnessFactorPosition: z.string().nonempty(),
});

export type TWellnessFactor = z.infer<typeof wellnessFactorSchema>;

export const wellnessFactorCategorySchema = z.object({
  wellnessFactorCategoryId: z.string().nonempty(),
  wellnessFactorCategoryName: z.string().nonempty(),
  wellnessFactorCategoryPosition: z.string().nonempty(),
});

export type TWellnessFactorCategory = z.infer<typeof wellnessFactorCategorySchema>;

export const getWellnessFactorsVoSchema = z.array(
  wellnessFactorCategorySchema.extend({
    wellnessFactors: z.array(wellnessFactorSchema),
  })
);

export type TGetWellnessFactorsVo = z.infer<typeof getWellnessFactorsVoSchema>;
