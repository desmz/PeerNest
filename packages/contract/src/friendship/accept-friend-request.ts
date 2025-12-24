import z from 'zod';

import { TApiMethod } from '../types';
import { conversationIdSchema, friendRequestIdSchema } from '../utils';

export const ACCEPT_FRIEND_REQUEST_METHOD: TApiMethod = 'post';

export const ACCEPT_FRIEND_REQUEST_URL = '/friend-requests/{requestId}/accept';

export const acceptFriendRequestParamsSchema = z.object({
  requestId: friendRequestIdSchema('Request Id'),
});

export type TAcceptFriendRequestParams = z.infer<typeof acceptFriendRequestParamsSchema>;

export const acceptFriendRequestVoSchema = z.object({
  conversationId: conversationIdSchema(),
});

export type TAcceptFriendRequestVo = z.infer<typeof acceptFriendRequestVoSchema>;
