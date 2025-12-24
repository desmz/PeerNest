import { DiscussionStatus, FindDiscussionsSortOption } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { interestIdSchema, personalGoalIdSchema, userIdSchema, zNonEmptyString } from '../utils';

import { getDiscussionVoSchema } from './get-discussion';

export const FIND_DISCUSSIONS_METHOD: TApiMethod = 'get';

export const FIND_DISCUSSIONS_URL = '/discussions';

const findDiscussionsQueryParams = {
  q: 'Query Param',
  interestIds: 'Interest Ids Param',
  goalIds: 'Goal Ids Param',
  authorId: 'Author Id Param',
  likedBy: 'Liked User Id Param',
  sort: 'Sort Param',
  limit: 'Limit Param',
  offset: 'Offset Param',
  statuses: 'Discussion Statutes Param',
} as const;

export const findDiscussionsQueryParamsSchema = z.object({
  q: zNonEmptyString(findDiscussionsQueryParams.q)
    .transform((val) => val?.trim())
    .nullish(),
  interestIds: z.array(interestIdSchema()).nullish(),
  goalIds: z.array(personalGoalIdSchema()).nullish(),
  authorId: userIdSchema(findDiscussionsQueryParams.authorId).nullish(),
  likedBy: userIdSchema(findDiscussionsQueryParams.likedBy).nullish(),
  sort: z.enum(FindDiscussionsSortOption).nullish(),
  limit: z.int().positive().nullish().nullish(),
  offset: z.int().positive().nullish().nullish(),
  statuses: z.array(z.enum(DiscussionStatus)).nullish(),
});

export type TFindDiscussionsQueryParams = z.infer<typeof findDiscussionsQueryParamsSchema>;

export const findDiscussionSchema = getDiscussionVoSchema.extend({
  rank: z.number(),
  score: z.string(),
});

export type TFindDiscussion = z.infer<typeof findDiscussionSchema>;

export const findDiscussionsVoSchema = z.object({
  count: z.number(),
  discussions: z.array(findDiscussionSchema),
});

export type TFindDiscussionsVo = z.infer<typeof findDiscussionsVoSchema>;
