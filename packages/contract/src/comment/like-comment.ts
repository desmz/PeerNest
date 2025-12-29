import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

export const LIKE_COMMENT_METHOD: TApiMethod = 'post';

export const LIKE_COMMENT_URL = '/comments/{commentId}/likes';

export const likeCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TLikeCommentParams = z.infer<typeof likeCommentParamsSchema>;
