import z from 'zod';

import { wellnessMoodSchema } from '../system';
import { TApiMethod } from '../types';
import { zPosInt } from '../utils';

export const GET_WELLNESS_MOODS_SUMMARY_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_MOODS_SUMMARY_URL = '/wellness/stats/moods';

export const getWellnessMoodsSummaryQueryParamFields = {
  days: 'Days Query Param',
} as const;

export const getWellnessMoodsSummaryQueryParamsSchema = z.object({
  days: zPosInt(getWellnessMoodsSummaryQueryParamFields.days).nullish(),
});

export type TGetWellnessMoodsSummaryQueryParams = z.infer<
  typeof getWellnessMoodsSummaryQueryParamsSchema
>;

export const wellnessMoodSummarySchema = wellnessMoodSchema.extend({
  count: z.int().positive(),
});

export type TWellnessMoodSummary = z.infer<typeof wellnessMoodSummarySchema>;

export const getWellnessMoodsSummaryVoSchema = z.object({
  count: z.int().positive(),
  wellnessMoods: z.array(wellnessMoodSummarySchema),
});

export type TGetWellnessMoodsSummaryVo = z.infer<typeof getWellnessMoodsSummaryVoSchema>;
