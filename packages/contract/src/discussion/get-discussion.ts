import { DiscussionStatus } from '@peernest/core';
import z from 'zod';

import { getInterestsVoSchema, getPersonalGoalsVoSchema } from '../system';
import { discussionIdSchema, userIdSchema } from '../utils';

export const GET_DISCUSSION_URL = '/discussions/{discussionId}';

export const getDiscussionParamsSchema = z.object({
  discussionId: discussionIdSchema(),
});

export type TGetDiscussionParams = z.infer<typeof getDiscussionParamsSchema>;

export const getDiscussionQueryParamsSchema = z.object({
  statuses: z.array(z.enum(DiscussionStatus)).nullish(),
});

export type TGetDiscussionQueryParams = z.infer<typeof getDiscussionQueryParamsSchema>;

export const discussionAuthorVoSchema = z.object({
  userId: userIdSchema(),
  userDisplayName: z.string().nonempty(),
  userAvatarUrl: z.string().nonempty(),
  roleName: z.string().nonempty(),
});

export const getDiscussionVoSchema = z.object({
  discussionId: discussionIdSchema(),
  discussionTitle: z.string().nonempty(),
  discussionContent: z.string().nonempty(),
  discussionStatus: z.enum(DiscussionStatus),
  discussionCreatedTime: z.date(),
  discussionUpdatedTime: z.date().nullable(),
  author: discussionAuthorVoSchema,
  interests: getInterestsVoSchema.nullable(),
  goals: getPersonalGoalsVoSchema.nullable(),
  likeCount: z.int(),
  commentCount: z.int(),
  isLiked: z.boolean(),
  isReported: z.boolean(),
  attachmentUrl: z.url().nullable(),
});

export type TGetDiscussionVo = z.infer<typeof getDiscussionVoSchema>;
