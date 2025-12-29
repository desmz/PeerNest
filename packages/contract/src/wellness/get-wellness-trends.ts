import { WellnessTrendsMetric } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zPosInt } from '../utils';

export const GET_WELLNESS_TRENDS_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_TRENDS_URL = '/wellness/stats/trends';

export const getWellnessTrendsQueryParamFields = {
  metrics: 'Metrics Query Param',
  days: 'Days Query Param',
} as const;

export const getWellnessTrendsQueryParamsSchema = z.object({
  metrics: z.array(z.enum(WellnessTrendsMetric)).nullish(),
  days: zPosInt(getWellnessTrendsQueryParamFields.days).nullish(),
});

export type TGetWellnessTrendsQueryParams = z.infer<typeof getWellnessTrendsQueryParamsSchema>;

export const wellnessTrendsValueDataSchema = z.object({
  date: z.string().nonempty(),
  value: z.number().nullable(),
});

export type TWellnessTrendsValueData = z.infer<typeof wellnessTrendsValueDataSchema>;

export const wellnessTrendsValueSchema = z.object({
  metric: z.enum(WellnessTrendsMetric),
  days: z.int().positive(),
  min: z.number().nullable(),
  max: z.number().nullable(),
  data: z.array(wellnessTrendsValueDataSchema),
});

export type TWellnessTrendsValue = z.infer<typeof wellnessTrendsValueSchema>;

export const getWellnessTrendsVoSchema = z.record(
  z.enum(WellnessTrendsMetric),
  wellnessTrendsValueSchema.nullable()
);

export type TGetWellnessTrendsVo = z.infer<typeof getWellnessTrendsVoSchema>;
