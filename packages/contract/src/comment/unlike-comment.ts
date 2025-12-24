import z from 'zod';

import { commentIdSchema } from '../utils';

export const UNLIKE_COMMENT_URL = '/comment/{commentId}/likes';

export const unlikeCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TUnlikeCommentParams = z.infer<typeof unlikeCommentParamsSchema>;
