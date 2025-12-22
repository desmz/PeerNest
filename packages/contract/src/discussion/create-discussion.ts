import {
  MAX_DISCUSSION_CONTENT_LEN,
  MAX_DISCUSSION_GOAL_TAGS,
  MAX_DISCUSSION_INTEREST_TAGS,
  MAX_DISCUSSION_TITLE_LEN,
  MIN_DISCUSSION_CONTENT_LEN,
  MIN_DISCUSSION_TITLE_LEN,
} from '@peernest/core';
import z from 'zod';

import {
  attachmentIdSchema,
  interestIdSchema,
  personalGoalIdSchema,
  zArrayMax,
  zMinMaxString,
} from '../utils';

import { getDiscussionVoSchema } from './get-discussion';

export const CREATE_DISCUSSION_URL = '/discussions';

export const createDiscussionFields = {
  discussionTitle: 'Title',
  discussionContent: 'Description',
  goalIds: 'Goals',
  interestIds: 'Interests',
  attachmentId: 'Attachment Id',
} as const;

export const createDiscussionRoSchema = z.object({
  discussionTitle: zMinMaxString(
    createDiscussionFields.discussionTitle,
    MIN_DISCUSSION_TITLE_LEN,
    MAX_DISCUSSION_TITLE_LEN
  ),
  discussionContent: zMinMaxString(
    createDiscussionFields.discussionContent,
    MIN_DISCUSSION_CONTENT_LEN,
    MAX_DISCUSSION_CONTENT_LEN
  ),
  goalIds: z
    .array(personalGoalIdSchema())
    .max(
      MAX_DISCUSSION_GOAL_TAGS,
      zArrayMax(createDiscussionFields.goalIds, MAX_DISCUSSION_GOAL_TAGS)
    )
    .nullable(),
  interestIds: z
    .array(interestIdSchema())
    .max(
      MAX_DISCUSSION_INTEREST_TAGS,
      zArrayMax(createDiscussionFields.interestIds, MAX_DISCUSSION_INTEREST_TAGS)
    )
    .nullable(),
  attachmentId: attachmentIdSchema().nullable(),
});

export type TCreateDiscussionRo = z.infer<typeof createDiscussionRoSchema>;

export const createDiscussionVoSchema = getDiscussionVoSchema;

export type TCreateDiscussionVo = z.infer<typeof createDiscussionVoSchema>;
