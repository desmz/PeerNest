import z from 'zod';

import { TApiMethod } from '../types';
import { banActionIdSchema } from '../utils';

export const UNBAN_USER_METHOD: TApiMethod = 'post';

export const UNBAN_USER_URL = '/manage/bans/{banActionId}/unban';

export const unbanUserParamsSchema = z.object({
  banActionId: banActionIdSchema(),
});

export type TUnBanUserParams = z.infer<typeof unbanUserParamsSchema>;
