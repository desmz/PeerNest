import { WellnessCheckInsSortOption } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zDate, zPosInt } from '../utils';

import { getWellnessCheckInVoSchema } from './get-wellness-check-in';

export const GET_MY_WELLNESS_CHECK_INS_METHOD: TApiMethod = 'get';

export const GET_MY_WELLNESS_CHECK_INS_URL = '/wellness/check-ins/me';

const getMyWellnessCheckInsQueryParamFields = {
  from: 'From Query Param',
  to: 'To Query Param',
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
  sort: 'Sort Query Param',
} as const;

export const getMyWellnessCheckInsQueryParamsSchema = z
  .object({
    from: z.coerce.date(zDate(getMyWellnessCheckInsQueryParamFields.from)).nullish(),
    to: z.coerce.date(zDate(getMyWellnessCheckInsQueryParamFields.to)).nullish(),
    limit: zPosInt(getMyWellnessCheckInsQueryParamFields.limit).nullish(),
    offset: zPosInt(getMyWellnessCheckInsQueryParamFields.offset).nullish(),
    sort: z.enum(WellnessCheckInsSortOption).nullish(),
  })
  .refine(
    (val) => {
      if (val.from && val.to && val.from > val.to) return false;
      else return true;
    },
    {
      error: `${getMyWellnessCheckInsQueryParamFields.from} must less than or equal to ${getMyWellnessCheckInsQueryParamFields.to}`,
    }
  );

export type TGetMyWellnessCheckInsQueryParams = z.infer<
  typeof getMyWellnessCheckInsQueryParamsSchema
>;

export const getMyWellnessCheckInsVoSchema = z.object({
  count: z.int().positive(),
  checkIns: z.array(getWellnessCheckInVoSchema),
});

export type TGetMyWellnessCheckInsVo = z.infer<typeof getMyWellnessCheckInsVoSchema>;
