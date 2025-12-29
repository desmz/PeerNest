import z from 'zod';

import { TApiMethod } from '../types';
import { friendRequestIdSchema } from '../utils';

export const REJECT_FRIEND_REQUEST_METHOD: TApiMethod = 'post';

export const REJECT_FRIEND_REQUEST_URL = '/friend-requests/{requestId}/reject';

export const rejectFriendRequestParamsSchema = z.object({
  requestId: friendRequestIdSchema('Request Id'),
});

export type TRejectFriendRequestParams = z.infer<typeof rejectFriendRequestParamsSchema>;
