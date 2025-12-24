import z from 'zod';

import { displayNameSchema } from '../auth';
import { userIdSchema } from '../utils';

export const GET_MY_FRIENDS_URL = '/me/friends';

export const getMyFriendSchema = z.object({
  userId: userIdSchema(),
  userDisplayName: displayNameSchema,
  userAvatarUrl: z.string().nonempty(),
  userLastSignedTime: z.date(),
  friendedTime: z.date(),
});

export type TGetMyFriend = z.infer<typeof getMyFriendSchema>;

export const getMyFriendsVoSchema = z.object({
  count: z.int(),
  friends: z.array(getMyFriendSchema),
});

export type TGetMyFriendsVo = z.infer<typeof getMyFriendsVoSchema>;
