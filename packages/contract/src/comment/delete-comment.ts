import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

export const DELETE_COMMENT_METHOD: TApiMethod = 'delete';

export const DELETE_COMMENT_URL = '/comments/{commentId}';

export const deleteCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TDeleteCommentParams = z.infer<typeof deleteCommentParamsSchema>;
