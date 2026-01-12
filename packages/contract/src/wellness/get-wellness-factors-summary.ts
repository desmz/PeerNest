import z from 'zod';

import { wellnessFactorSchema } from '../system';
import { TApiMethod } from '../types';
import { zPosInt } from '../utils';

export const GET_WELLNESS_FACTORS_SUMMARY_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_FACTORS_SUMMARY_URL = '/wellness/stats/factors';

export const getWellnessFactorsSummaryQueryParamFields = {
  days: 'Days Query Param',
} as const;

export const getWellnessFactorsSummaryQueryParamsSchema = z.object({
  days: zPosInt(getWellnessFactorsSummaryQueryParamFields.days).nullish(),
});

export type TGetWellnessFactorsSummaryQueryParams = z.infer<
  typeof getWellnessFactorsSummaryQueryParamsSchema
>;

export const wellnessFactorSummarySchema = wellnessFactorSchema.extend({
  count: z.int().positive(),
});

export type TWellnessFactorSummary = z.infer<typeof wellnessFactorSummarySchema>;

export const getWellnessFactorsSummaryVoSchema = z.object({
  count: z.int().positive(),
  wellnessFactors: z.array(wellnessFactorSummarySchema),
});

export type TGetWellnessFactorsSummaryVo = z.infer<typeof getWellnessFactorsSummaryVoSchema>;
