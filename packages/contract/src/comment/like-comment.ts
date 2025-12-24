import z from 'zod';

import { commentIdSchema } from '../utils';

export const LIKE_COMMENT_URL = '/comment/{commentId}/likes';

export const likeCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TLikeCommentParams = z.infer<typeof likeCommentParamsSchema>;
