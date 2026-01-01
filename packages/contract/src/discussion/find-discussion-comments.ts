import { FindDiscussionCommentsSortOption } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema, discussionIdSchema } from '../utils';

import { discussionAuthorVoSchema } from './get-discussion';

export const FIND_DISCUSSION_COMMENTS_METHOD: TApiMethod = 'get';

export const FIND_DISCUSSION_COMMENTS_URL = '/discussions/{discussionId}/comments';

export const findDiscussionCommentsParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TFindDiscussionCommentsParams = z.infer<typeof findDiscussionCommentsParamsSchema>;

export const findDiscussionCommentsQueryParamsSchema = z.object({
  sort: z.enum(FindDiscussionCommentsSortOption).nullish(),
  limit: z.int().nullish(),
  offset: z.int().nullish(),
});

export type TFindDiscussionCommentsQueryParams = z.infer<
  typeof findDiscussionCommentsQueryParamsSchema
>;

export const findDiscussionCommentSchema = z.object({
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
  isDeleted: z.literal(true),

  get replies() {
    return z.array(findDiscussionCommentSchema).nullable();
  },
});

export const deletedFindDiscussionCommentsSchema = z.object({
  commentId: commentIdSchema(),
  commentParentCommentId: commentIdSchema().nullable(),
  isDeleted: z.literal(false),
  replies: z.array(z.any()),
});

export const mixedFindDiscussionCommentsSchema = z.discriminatedUnion('isDeleted', [
  findDiscussionCommentSchema,
  deletedFindDiscussionCommentsSchema,
]);

export type TMixedFindDiscussionCommentsSchema = z.infer<typeof mixedFindDiscussionCommentsSchema>;

export const findDiscussionCommentsVoSchema = z.object({
  comments: z.array(mixedFindDiscussionCommentsSchema),
  count: z.int(),
});

export type TFindDiscussionCommentsVo = z.infer<typeof findDiscussionCommentsVoSchema>;
