import z from 'zod';

import { TApiMethod } from '../types';
import { discussionIdSchema } from '../utils';

export const ARCHIVE_DISCUSSION_METHOD: TApiMethod = 'post';

export const ARCHIVE_DISCUSSION_URL = '/discussions/{discussionId}/archive';

export const archiveDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TArchiveDiscussionParams = z.infer<typeof archiveDiscussionParamsSchema>;
