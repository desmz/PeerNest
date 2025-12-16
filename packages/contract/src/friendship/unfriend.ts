import z from 'zod';

import { userIdSchema } from '../utils';

export const UNFRIEND = '/me/friends/{friendId}';

export const unfriendParamsSchema = z.object({
  friendId: userIdSchema('Friend Id'),
});

export type TUnfriendParams = z.infer<typeof unfriendParamsSchema>;
