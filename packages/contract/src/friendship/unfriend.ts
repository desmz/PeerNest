import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema } from '../utils';

export const UNFRIEND_METHOD: TApiMethod = 'delete';

export const UNFRIEND_URL = '/me/friends/{friendId}';

export const unfriendParamsSchema = z.object({
  friendId: userIdSchema('Friend Id'),
});

export type TUnfriendParams = z.infer<typeof unfriendParamsSchema>;
