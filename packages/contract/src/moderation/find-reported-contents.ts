import {
  FindReportedContentsSortOption,
  FindReportedContentsTypeOption,
  IdPrefix,
  ReportedContentStatus,
} from '@peernest/core';
import z from 'zod';

import { createCommentVoSchema } from '../comment';
import { getDiscussionVoSchema } from '../discussion';
import { TApiMethod } from '../types';
import { discussionIdSchema, userIdSchema, zNonEmptyString, zPosInt } from '../utils';

export const FIND_REPORTED_CONTENTS_METHOD: TApiMethod = 'get';

export const FIND_REPORTED_CONTENTS_URL = '/manage/reports';

export const findReportedContentsQueryParamFields = {
  type: 'Type Query Param',
  sort: 'Sort Query Param',
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
} as const;

export const findReportedContentsQueryParamsSchema = z.object({
  type: z.enum(FindReportedContentsTypeOption).nullish(),
  sort: z.enum(FindReportedContentsSortOption).nullish(),
  limit: zPosInt(findReportedContentsQueryParamFields.limit).nullish(),
  offset: zPosInt(findReportedContentsQueryParamFields.offset).nullish(),
});

export type TFindReportedContentsQueryParams = z.infer<
  typeof findReportedContentsQueryParamsSchema
>;

export const reportIdSchema = (field = 'Report Id') =>
  zNonEmptyString(field).refine(
    (value) =>
      value.startsWith(IdPrefix.UserDiscussionReport) ||
      value.startsWith(IdPrefix.UserCommentReport),
    {
      error: `${field} must start with ${IdPrefix.UserDiscussionReport} or ${IdPrefix.UserCommentReport}`,
    }
  );

export const reportedContentBaseSchema = z.object({
  reportId: reportIdSchema(),
  type: z.enum(FindReportedContentsTypeOption),
  reportStatus: z.enum(ReportedContentStatus),
  reportedTime: z.date(),
  reporter: z.object({
    userId: userIdSchema(),
    userDisplayName: z.string().nonempty(),
  }),
});

export type TReportedContentBase = z.infer<typeof reportedContentBaseSchema>;

export const reportedDiscussionSchema = reportedContentBaseSchema.extend({
  target: getDiscussionVoSchema.omit({
    likeCount: true,
    commentCount: true,
    isLiked: true,
    isReported: true,
  }),
});

export type TReportedDiscussion = z.infer<typeof reportedDiscussionSchema>;

export const reportedCommentSchema = reportedContentBaseSchema.extend({
  target: createCommentVoSchema
    .omit({
      discussionId: true,
      likeCount: true,
      replyCount: true,
      isLiked: true,
      isReplied: true,
      isReported: true,
    })
    .extend({
      discussion: z.object({
        discussionId: discussionIdSchema(),
        discussionTitle: z.string().nonempty(),
      }),
    }),
});

export type TReportedComment = z.infer<typeof reportedCommentSchema>;

export const reportedContentSchema = z.discriminatedUnion('type', [
  reportedDiscussionSchema,
  reportedCommentSchema,
]);

export type TReportedContent = z.infer<typeof reportedContentSchema>;

export const findReportedContentsVoSchema = z.object({
  count: z.int().positive(),
  reportedContents: z.array(reportedContentSchema),
});

export type TFindReportedContentsVo = z.infer<typeof findReportedContentsVoSchema>;
