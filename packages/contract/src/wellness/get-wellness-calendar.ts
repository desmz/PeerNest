import { MAX_MONTH, MAX_YEAR, MIN_MONTH, MIN_YEAR } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zMax, zMin, zPosInt } from '../utils';

export const GET_WELLNESS_CALENDAR_METHOD: TApiMethod = 'get';

export const GET_WELLNESS_CALENDAR_URL = '/wellness/stats/calendar';

export const getWellnessCalendarQueryParamFields = {
  year: 'Year Query Param',
  month: 'Month Query Param',
} as const;

export const getWellnessCalendarQueryParamsSchema = z.object({
  year: zPosInt(getWellnessCalendarQueryParamFields.year)
    .min(MIN_YEAR, zMin(getWellnessCalendarQueryParamFields.year, MIN_YEAR, 'year'))
    .max(MAX_YEAR, zMax(getWellnessCalendarQueryParamFields.year, MAX_YEAR, 'year'))
    .nullish(),
  month: zPosInt(getWellnessCalendarQueryParamFields.month)
    .min(MIN_MONTH, zMin(getWellnessCalendarQueryParamFields.month, MIN_MONTH, 'month'))
    .max(MAX_MONTH, zMax(getWellnessCalendarQueryParamFields.month, MAX_MONTH, 'month'))
    .nullish(),
});

export type TGetWellnessCalendarQueryParams = z.infer<typeof getWellnessCalendarQueryParamsSchema>;

export const getWellnessCalendarVoSchema = z.array(
  z.object({
    checkInDate: z.string().nonempty(),
    moodRating: z.int().positive(),
  })
);

export type TGetWellnessCalendarVoSchema = z.infer<typeof getWellnessCalendarVoSchema>;
