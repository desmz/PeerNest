import z from 'zod';

import { commentIdSchema } from '../utils';

export const REPORT_COMMENT_URL = '/comments/{commentId}/reports';

export const reportCommentParamsSchema = z.object({
  commentId: commentIdSchema(),
});

export type TReportCommentParams = z.infer<typeof reportCommentParamsSchema>;
