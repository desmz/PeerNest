import z from 'zod';

import { TApiMethod } from '../types';
import { discussionIdSchema } from '../utils';

export const DELETE_DISCUSSION_METHOD: TApiMethod = 'delete';

export const DELETE_DISCUSSION_URL = '/discussions/{discussionId}';

export const deleteDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TDeleteDiscussionParams = z.infer<typeof deleteDiscussionParamsSchema>;
