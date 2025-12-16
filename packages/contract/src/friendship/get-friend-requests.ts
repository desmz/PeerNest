import { FriendRequestStatus, GetFriendRequestsType } from '@peernest/core';
import z from 'zod';

import { displayNameSchema } from '../auth';
import { userIdSchema } from '../utils';

export const GET_FRIEND_REQUESTS = '/friend-requests';

export const getFriendRequestsQueryParamsSchema = z.object({
  status: z.enum(FriendRequestStatus).nullish(),
  type: z.enum(GetFriendRequestsType).nullish(),
});

export type TGetFriendRequestQueryParams = z.infer<typeof getFriendRequestsQueryParamsSchema>;

export const getFriendRequestSchema = z.object({
  userId: userIdSchema(),
  userDisplayName: displayNameSchema,
  userAvatarUrl: z.string().nonempty(),
  userLastSignedTime: z.date(),
  friendRequestStatus: z.enum(FriendRequestStatus),
  sendFriendRequestTime: z.date(),
  friendedTime: z.date().nullable(),
});

export type TGetFriendRequest = z.infer<typeof getFriendRequestSchema>;

export const getFriendRequestsVoSchema = z.object({
  count: z.int(),
  friendRequests: z.array(getFriendRequestSchema),
});

export type TGetFriendRequestVo = z.infer<typeof getFriendRequestsVoSchema>;
