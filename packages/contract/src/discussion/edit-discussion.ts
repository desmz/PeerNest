import z from 'zod';

import { discussionIdSchema } from '../utils';

import { createDiscussionRoSchema } from './create-discussion';
import { getDiscussionVoSchema } from './get-discussion';

export const EDIT_DISCUSSION_URL = '/discussions/{discussionId}';

export const editDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TEditDiscussionParams = z.infer<typeof editDiscussionParamsSchema>;

export const editDiscussionFields = {
  discussionTitle: 'Title',
  discussionContent: 'Description',
  goalIds: 'Goals',
  interestIds: 'Interests',
  attachmentId: 'Attachment Id',
} as const;

export const editDiscussionRoSchema = createDiscussionRoSchema;

export type TEditDiscussionRo = z.infer<typeof editDiscussionRoSchema>;

export const editDiscussionVoSchema = getDiscussionVoSchema;

export type TEditDiscussionVo = z.infer<typeof editDiscussionVoSchema>;
