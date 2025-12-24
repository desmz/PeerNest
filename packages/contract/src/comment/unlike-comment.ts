import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

export const UNLIKE_COMMENT_METHOD: TApiMethod = 'delete';

export const UNLIKE_COMMENT_URL = '/comments/{commentId}/likes';

export const unlikeCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TUnlikeCommentParams = z.infer<typeof unlikeCommentParamsSchema>;
