import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

import { commentContentSchema, createCommentVoSchema } from './create-comment';

export const REPLY_COMMENT_METHOD: TApiMethod = 'post';

export const REPLY_COMMENT_URL = '/comments/{commentId}/replies';

export const replyCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TReplyCommentParams = z.infer<typeof replyCommentParamsSchema>;

const replyCommentFields = {
  commentContent: 'Reply Content',
} as const;

export const replyCommentRoSchema = z.object({
  commentContent: commentContentSchema(replyCommentFields.commentContent),
});

export type TReplyCommentRo = z.infer<typeof replyCommentRoSchema>;

export const replyCommentVoSchema = createCommentVoSchema;

export type TReplyCommentVo = z.infer<typeof replyCommentVoSchema>;
