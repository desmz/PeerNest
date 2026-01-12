import z from 'zod';

import { TApiMethod } from '../types';

import { reportIdSchema } from './find-reported-contents';

export const DELETE_REPORTED_CONTENT_METHOD: TApiMethod = 'post';

export const DELETE_REPORTED_CONTENT_URL = '/manage/reports/{reportId}/delete';

export const deleteReportedContentParamFields = {
  reportId: 'Report Id Param',
} as const;

export const deleteReportedContentParamsSchema = z.object({
  reportId: reportIdSchema(deleteReportedContentParamFields.reportId),
});

export type TDeleteReportedContentParams = z.infer<typeof deleteReportedContentParamsSchema>;
