import z from 'zod';

import { commentIdSchema } from '../utils';

export const DELETE_COMMENT_URL = '/comment/{commentId}';

export const deleteCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TDeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>;
