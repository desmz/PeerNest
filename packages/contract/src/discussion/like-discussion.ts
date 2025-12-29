import z from 'zod';

import { TApiMethod } from '../types';
import { discussionIdSchema } from '../utils';

export const LIKE_DISCUSSION_METHOD: TApiMethod = 'post';

export const LIKE_DISCUSSION_URL = '/discussions/{discussionId}/likes';

export const likeDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TLikeDiscussionParams = z.infer<typeof likeDiscussionParamsSchema>;
