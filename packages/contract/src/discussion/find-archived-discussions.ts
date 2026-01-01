import { FindArchivedDiscussionsSortOption } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema, zPosInt } from '../utils';

import { getDiscussionVoSchema } from './get-discussion';

export const FIND_ARCHIVED_DISCUSSIONS_METHOD: TApiMethod = 'get';

export const FIND_ARCHIVED_DISCUSSIONS_URL = '/discussions/archived';

export const findArchivedDiscussionsQueryParamFields = {
  sort: 'Sort Query Param',
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
} as const;

export const findArchivedDiscussionsQueryParamsSchema = z.object({
  sort: z.enum(FindArchivedDiscussionsSortOption).nullish(),
  limit: zPosInt(findArchivedDiscussionsQueryParamFields.limit).nullish(),
  offset: zPosInt(findArchivedDiscussionsQueryParamFields.offset).nullish(),
});

export type TFindArchivedDiscussionsQueryParams = z.infer<
  typeof findArchivedDiscussionsQueryParamsSchema
>;

export const findArchivedDiscussionSchema = getDiscussionVoSchema
  .omit({
    isLiked: true,
    isReported: true,
  })
  .extend({
    discussionArchivedBy: userIdSchema(),
    discussionArchivedTime: z.date(),
  });

export type TFindArchivedDiscussion = z.infer<typeof findArchivedDiscussionSchema>;

export const findArchivedDiscussionsVoSchema = z.object({
  count: z.int().positive(),
  discussions: z.array(findArchivedDiscussionSchema),
});

export type TFindArchivedDiscussionVo = z.infer<typeof findArchivedDiscussionsVoSchema>;
