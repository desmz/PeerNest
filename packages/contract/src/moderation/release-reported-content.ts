import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { zNonEmptyString } from '../utils';

export const RELEASE_REPORTED_CONTENT_METHOD: TApiMethod = 'post';

export const RELEASE_REPORTED_CONTENT_URL = '/manage/reports/{reportId}/release';

export const releaseReportedContentParamFields = {
  reportId: 'Report Id Param',
} as const;

export const releaseReportedContentParamsSchema = z.object({
  reportId: zNonEmptyString(releaseReportedContentParamFields.reportId).refine(
    (value) =>
      value.startsWith(IdPrefix.UserDiscussionReport) ||
      value.startsWith(IdPrefix.UserCommentReport),
    {
      error: `${releaseReportedContentParamFields.reportId} must start with ${IdPrefix.UserDiscussionReport} or ${IdPrefix.UserCommentReport}`,
    }
  ),
});

export type TReleaseReportedContentParams = z.infer<typeof releaseReportedContentParamsSchema>;
