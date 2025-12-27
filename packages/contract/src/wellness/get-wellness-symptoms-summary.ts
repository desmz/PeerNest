import z from 'zod';

import { wellnessSymptomSchema } from '../system';
import { TApiMethod } from '../types';
import { zPosInt } from '../utils';

export const GET_WELLNESS_SYMPTOMS_SUMMARY_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_SYMPTOMS_SUMMARY_URL = '/wellness/stats/symptoms';

export const getWellnessSymptomsSummaryQueryParamFields = {
  days: 'Days Query Param',
} as const;

export const getWellnessSymptomsSummaryQueryParamsSchema = z.object({
  days: zPosInt(getWellnessSymptomsSummaryQueryParamFields.days).nullish(),
});

export type TGetWellnessSymptomsSummaryQueryParams = z.infer<
  typeof getWellnessSymptomsSummaryQueryParamsSchema
>;

export const wellnessSymptomSummarySchema = wellnessSymptomSchema.extend({
  count: z.int().positive(),
});

export type TWellnessSymptomSummary = z.infer<typeof wellnessSymptomSummarySchema>;

export const getWellnessSymptomsSummaryVoSchema = z.object({
  count: z.int().positive(),
  wellnessSymptoms: z.array(wellnessSymptomSummarySchema),
});

export type TGetWellnessSymptomsSummaryVo = z.infer<typeof getWellnessSymptomsSummaryVoSchema>;
