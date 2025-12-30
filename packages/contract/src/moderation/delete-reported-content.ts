import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zNonEmptyString } from '../utils';

export const DELETE_REPORTED_CONTENT_METHOD: TApiMethod = 'post';

export const DELETE_REPORTED_CONTENT_URL = '/manage/reports/{reportId}/delete';

export const deleteReportedContentParamFields = {
  reportId: 'Report Id Param',
} as const;

export const deleteReportedContentParamsSchema = z.object({
  reportId: zNonEmptyString(deleteReportedContentParamFields.reportId).refine(
    (value) =>
      value.startsWith(IdPrefix.UserDiscussionReport) ||
      value.startsWith(IdPrefix.UserCommentReport),
    {
      error: `${deleteReportedContentParamFields.reportId} must start with ${IdPrefix.UserDiscussionReport} or ${IdPrefix.UserCommentReport}`,
    }
  ),
});

export type TDeleteReportedContentParams = z.infer<typeof deleteReportedContentParamsSchema>;
