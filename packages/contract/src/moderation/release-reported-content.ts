import z from 'zod';

import { TApiMethod } from '../types';

import { reportIdSchema } from './find-reported-contents';

export const RELEASE_REPORTED_CONTENT_METHOD: TApiMethod = 'post';

export const RELEASE_REPORTED_CONTENT_URL = '/manage/reports/{reportId}/release';

export const releaseReportedContentParamFields = {
  reportId: 'Report Id Param',
} as const;

export const releaseReportedContentParamsSchema = z.object({
  reportId: reportIdSchema(releaseReportedContentParamFields.reportId),
});

export type TReleaseReportedContentParams = z.infer<typeof releaseReportedContentParamsSchema>;
