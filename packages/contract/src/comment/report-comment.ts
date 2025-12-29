import z from 'zod';

import { TApiMethod } from '../types';
import { commentIdSchema } from '../utils';

export const REPORT_COMMENT_METHOD: TApiMethod = 'post';

export const REPORT_COMMENT_URL = '/comments/{commentId}/reports';

export const reportCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TReportCommentParams = z.infer<typeof reportCommentParamsSchema>;
