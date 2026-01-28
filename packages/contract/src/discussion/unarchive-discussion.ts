import z from 'zod';

import { TApiMethod } from '../types';
import { discussionIdSchema } from '../utils';

export const UNARCHIVE_DISCUSSION_METHOD: TApiMethod = 'post';

export const UNARCHIVE_DISCUSSION_URL = '/discussions/{discussionId}/unarchive';

export const unarchiveDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TUnarchiveDiscussionParams = z.infer<typeof unarchiveDiscussionParamsSchema>;
