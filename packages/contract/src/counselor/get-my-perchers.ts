import z from 'zod';

import { TApiMethod } from '../types';
import { findUserBaseSchema } from '../user';
import { counselorUserIdSchema, zPosInt } from '../utils';

export const GET_MY_PERCHER_METHOD: TApiMethod = 'get';

export const GET_MY_PERCHER_URL = '/counselors/me/perchers';

export const getMyPerchersQueryParamFields = {
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
} as const;

export const getMyPerchersQueryParamsSchema = z.object({
  limit: zPosInt(getMyPerchersQueryParamFields.limit).nullish(),
  offset: zPosInt(getMyPerchersQueryParamFields.offset).nullish(),
});

export type TGetMyPerchersQueryParams = z.infer<typeof getMyPerchersQueryParamsSchema>;

export const counselorUserSchema = z.object({
  counselorUserId: counselorUserIdSchema(),
  counselorUserCounselorId: z.string().nonempty(),
  counselorUserNote: z.string().nonempty().nullable(),
  counselorUserUpdatedTime: z.date().nullable(),
  user: findUserBaseSchema,
});

export type TCounselorUser = z.infer<typeof counselorUserSchema>;

export const getMyPerchersVoSchema = z.object({
  count: z.int().positive(),
  counselorUsers: z.array(counselorUserSchema),
});

export type TGetMyPerchersVo = z.infer<typeof getMyPerchersVoSchema>;
