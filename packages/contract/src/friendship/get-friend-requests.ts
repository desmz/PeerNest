import { FriendRequestStatus, FriendRequestType } from '@peernest/core';
import z from 'zod';

import { getMyFriendSchema } from './get-my-friends';

export const GET_FRIEND_REQUESTS_URL = '/friend-requests';

export const getFriendRequestsQueryParamsSchema = z.object({
  status: z.enum(FriendRequestStatus).nullish(),
  type: z.enum(FriendRequestType).nullish(),
});

export type TGetFriendRequestQueryParams = z.infer<typeof getFriendRequestsQueryParamsSchema>;

export const getFriendRequestSchema = getMyFriendSchema.extend({
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
