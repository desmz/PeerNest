import z from 'zod';

import { conversationIdSchema, userIdSchema } from '../utils';

export const SEND_FRIEND_REQUEST = '/friend-request';

export const sendFriendRequestFields = {
  toId: 'To-User Id',
} as const;

export const sendFriendRequestRoSchema = z.object({
  toId: userIdSchema(sendFriendRequestFields.toId),
});

export type TSendFriendRequestRo = z.infer<typeof sendFriendRequestRoSchema>;

export const sendFriendRequestVoSchema = z.object({
  isAutoMatch: z.boolean(),
  conversationId: conversationIdSchema().nullable(),
});

export type TSendFriendRequestVo = z.infer<typeof sendFriendRequestVoSchema>;
