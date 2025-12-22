import { MAX_COMMENT_CONTENT_LEN, MIN_COMMENT_CONTENT_LEN } from '@peernest/core';
import z from 'zod';

import { discussionAuthorVoSchema } from '../discussion';
import { commentIdSchema, discussionIdSchema, zMinMaxString } from '../utils';

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

export const createCommentVoSchema = z.object({
  commentId: commentIdSchema(),
  discussionId: discussionIdSchema(),
  commentParentCommentId: commentIdSchema().nullable(),
  commentContent: z.string().nonempty(),
  commentCreatedTime: z.date(),
  commentUpdatedTime: z.date().nullable(),
  author: discussionAuthorVoSchema,
  likeCount: z.int(),
  replyCount: z.int(),
  isLiked: z.boolean(),
  isReplied: z.boolean(),
  isReported: z.boolean(),
});

export type TCreateCommentVo = z.infer<typeof createCommentVoSchema>;
