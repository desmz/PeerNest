import { WellnessOverviewMetric, WellnessOverviewTrend } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zPosInt } from '../utils';

export const GET_WELLNESS_OVERVIEW_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_OVERVIEW_URL = '/wellness/stats/overview';

export const getWellnessOverviewQueryParamFields = {
  days: 'Days Query Param',
} as const;

export const getWellnessOverviewQueryParamsSchema = z.object({
  days: zPosInt(getWellnessOverviewQueryParamFields.days).nullish(),
});

export type TGetWellnessOverviewQueryParams = z.infer<typeof getWellnessOverviewQueryParamsSchema>;

export const wellnessOverviewValueSchema = z.object({
  average: z.int().positive().nullable(),
  changePercentage: z.number(),
  trend: z.enum(WellnessOverviewTrend),
});

export type TWellnessOverviewValue = z.infer<typeof wellnessOverviewValueSchema>;

export const getWellnessOverviewVoSchema = z.record(
  z.enum(WellnessOverviewMetric),
  wellnessOverviewValueSchema
);

export type TGetWellnessOverviewVo = z.infer<typeof getWellnessOverviewVoSchema>;
