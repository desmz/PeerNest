import z from 'zod';

import { TApiMethod } from '../types';
import { banRequestIdSchema, zDate } from '../utils';

export const APPROVE_BAN_REQUEST_METHOD: TApiMethod = 'post';

export const APPROVE_BAN_REQUEST_URL = '/manage/ban-requests/{banRequestId}/approve';

export const approveBanRequestParamsSchema = z.object({
  banRequestId: banRequestIdSchema(),
});

export type TApproveBanRequestParams = z.infer<typeof approveBanRequestParamsSchema>;

export const approveBanRequestFields = {
  banEndTime: 'Ban End Time',
} as const;

export const approveBanRequestRoSchema = z.object({
  banEndTime: z.coerce.date(zDate(approveBanRequestFields.banEndTime)).nullable(),
});

export type TApproveBanRequestRo = z.infer<typeof approveBanRequestRoSchema>;
