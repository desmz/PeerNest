import z from 'zod';

import { TApiMethod } from '../types';
import { discussionIdSchema } from '../utils';

export const REPORT_DISCUSSION_METHOD: TApiMethod = 'post';

export const REPORT_DISCUSSION_URL = '/discussions/{discussionId}/reports';

export const reportDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TReportDiscussionParams = z.infer<typeof reportDiscussionParamsSchema>;
