import { FindBanUsersStatus } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { findUserBaseSchema } from '../user';
import { zPosInt } from '../utils';

export const FIND_BAN_USERS_METHOD: TApiMethod = 'get';

export const FIND_BAN_USERS_URL = '/manage/bans';

export const findBanUsersQueryParamFields = {
  status: 'Status Query Param',
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
} as const;

export const findBanUsersQueryParamsSchema = z.object({
  status: z.enum(FindBanUsersStatus).nullish(),
  limit: zPosInt(findBanUsersQueryParamFields.limit).nullish(),
  offset: zPosInt(findBanUsersQueryParamFields.offset).nullish(),
});

export type TFindBanUsersQueryParams = z.infer<typeof findBanUsersQueryParamsSchema>;

const banUserBaseSchema = z.object({
  banId: z.string().nonempty(),
  status: z.enum(FindBanUsersStatus),
  bannedUser: findUserBaseSchema,
});

export type TBanUserBase = z.infer<typeof banUserBaseSchema>;

const banUserReviewStatusSchema = banUserBaseSchema.extend({
  banRequestRequesterId: z.string().nonempty(),
  banRequestRequesterName: z.string().nonempty(),
  banRequestStatus: z.string().nonempty(),
  banRequestReason: z.string().nonempty(),
  banRequestCreatedTime: z.date(),
  proofs: z.array(z.string().nonempty()),
});

export type TBanUserReviewStatus = z.infer<typeof banUserReviewStatusSchema>;

const banUserBannedStatusSchema = banUserBaseSchema.extend({
  banActionBannedBy: z.string().nonempty(),
  bannedByUserName: z.string().nonempty(),
  banActionReason: z.string().nonempty(),
  banActionBanStartTime: z.date(),
  proofs: z.array(z.string().nonempty()),
});

export type TBanUserBannedStatus = z.infer<typeof banUserBannedStatusSchema>;

export const banUserSchema = z.discriminatedUnion('status', [
  banUserReviewStatusSchema,
  banUserBannedStatusSchema,
]);

export type TBanUserSchema = z.infer<typeof banUserSchema>;

export const findBanUsersVoSchema = z.object({
  count: z.int().positive(),
  bannedUsers: z.array(banUserSchema),
});

export type TFindBanUsersVo = z.infer<typeof findBanUsersVoSchema>;
