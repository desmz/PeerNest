import { MAX_BAN_REQUEST_REASON_LEN, MIN_BAN_REQUEST_REASON_LEN } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema, zMinMaxString, zNonEmptyString } from '../utils';

export const CREATE_BAN_REQUEST_METHOD: TApiMethod = 'post';

export const CREATE_BAN_REQUEST_URL = '/manage/ban-requests';

export const createBanRequestFields = {
  bannedUserId: 'Banned User Id',
  reason: 'Reason',
  proofReferenceRaw: 'Proof Reference Raw',
} as const;

export const createBanRequestRoSchema = z.object({
  bannedUserId: userIdSchema(createBanRequestFields.bannedUserId),
  reason: zMinMaxString(
    createBanRequestFields.reason,
    MIN_BAN_REQUEST_REASON_LEN,
    MAX_BAN_REQUEST_REASON_LEN
  ),
  proofReferenceRaw: zNonEmptyString(createBanRequestFields.proofReferenceRaw),
});

export type TCreateBanRequestRo = z.infer<typeof createBanRequestRoSchema>;
