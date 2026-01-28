import { MAX_BAN_REQUEST_REASON_LEN, MIN_BAN_REQUEST_REASON_LEN } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema, zDate, zMinMaxString } from '../utils';

export const BAN_USER_METHOD: TApiMethod = 'post';

export const BAN_USER_URL = '/manage/bans';

export const banUserFields = {
  bannedUserId: 'Banned User Id',
  reason: 'Reason',
  banEndTime: 'Ban End Time',
} as const;

export const banUserRoSchema = z.object({
  bannedUserId: userIdSchema(banUserFields.bannedUserId),
  reason: zMinMaxString(
    banUserFields.reason,
    MIN_BAN_REQUEST_REASON_LEN,
    MAX_BAN_REQUEST_REASON_LEN
  ),
  banEndTime: z.coerce.date(zDate(banUserFields.banEndTime)).nullable(),
});

export type TBanUserRo = z.infer<typeof banUserRoSchema>;
