import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

import { commentContentSchema, createCommentVoSchema } from './create-comment';

export const EDIT_COMMENT_METHOD: TApiMethod = 'put';

export const EDIT_COMMENT_URL = '/comments/{commentId}';

export const editCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TEditCommentParams = z.infer<typeof editCommentParamsSchema>;

const editCommentFields = {
  commentContent: 'Content',
} as const;

export const editCommentRoSchema = z.object({
  commentContent: commentContentSchema(editCommentFields.commentContent),
});

export type TEditCommentRo = z.infer<typeof editCommentRoSchema>;

export const editCommentVoSchema = createCommentVoSchema;

export type TEditCommentVo = z.infer<typeof editCommentVoSchema>;
