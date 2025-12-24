import z from 'zod';

import { commentIdSchema } from '../utils';

import { commentContentSchema, createCommentVoSchema } from './create-comment';

export const REPLY_COMMENT_URL = '/comment/{commentId}/replies';

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
