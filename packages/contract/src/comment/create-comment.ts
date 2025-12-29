import { MAX_COMMENT_CONTENT_LEN, MIN_COMMENT_CONTENT_LEN } from '@peernest/core';
import z from 'zod';

import { findDiscussionCommentSchema } from '../discussion';
import { TApiMethod } from '../types';
import { discussionIdSchema, zMinMaxString } from '../utils';

export const CREATE_COMMENT_METHOD: TApiMethod = 'post';

export const CREATE_COMMENT_URL = '/comments';

export const createCommentFields = {
  discussionId: 'Discussion Id',
  commentContent: 'Content',
} as const;

export const commentContentSchema = (field: string) =>
  zMinMaxString(field, MIN_COMMENT_CONTENT_LEN, MAX_COMMENT_CONTENT_LEN);

export const createCommentRoSchema = z.object({
  discussionId: discussionIdSchema(),
  commentContent: commentContentSchema(createCommentFields.commentContent),
});

export type TCreateCommentRo = z.infer<typeof createCommentRoSchema>;

export const createCommentVoSchema = findDiscussionCommentSchema.omit({
  isDeleted: true,
  replies: true,
});

export type TCreateCommentVo = z.infer<typeof createCommentVoSchema>;
