import { FindUserCommentsSortOption, FindUserCommentsType } from '@peernest/core';
import z from 'zod';

import { getDiscussionVoSchema } from '../discussion';
import { TApiMethod } from '../types';
import { userIdSchema } from '../utils';

import { createCommentVoSchema } from './create-comment';

export const FIND_USER_COMMENTS_METHOD: TApiMethod = 'get';

export const FIND_USER_COMMENTS_URL = '/comments';

export const findUserCommentsQueryParamsSchema = z.object({
  authorId: userIdSchema('Author Id'),
  sort: z.enum(FindUserCommentsSortOption).nullish(),
  limit: z.int().nullish(),
  offset: z.int().nullish(),
  type: z.enum(FindUserCommentsType).nullish(),
});

export type TFindUserCommentsQueryParams = z.infer<typeof findUserCommentsQueryParamsSchema>;

export const findUserBaseCommentSchema = createCommentVoSchema;

export type TFindUserBaseComment = z.infer<typeof findUserBaseCommentSchema>;

export const findUserCommentSchema = findUserBaseCommentSchema.extend({
  parentComment: findUserBaseCommentSchema.nullable(),
  discussion: getDiscussionVoSchema.nullable(),
});

export type TFindUserComment = z.infer<typeof findUserCommentSchema>;

export const findUserCommentsVoSchema = z.object({
  count: z.int(),
  comments: z.array(findUserCommentSchema),
});

export type TFindUserCommentsVo = z.infer<typeof findUserCommentsVoSchema>;
