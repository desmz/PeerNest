import z from 'zod';

import { discussionIdSchema } from '../utils';

export const UNLIKE_DISCUSSION_URL = '/discussions/{discussionId}/likes';

export const unlikeDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TUnlikeDiscussionParams = z.infer<typeof unlikeDiscussionParamsSchema>;
