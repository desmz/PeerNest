import { FriendRequestStatus, FriendRequestType, RelationshipType } from '@peernest/core';
import z from 'zod';

import { conversationIdSchema, userIdSchema } from '../utils';

import { findUserSchema } from './find-users';

export const GET_USER_PROFILE = '/users/{userId}/profile';

export const getUserProfileParamsSchema = z.object({
  userId: userIdSchema(),
});

export type TGetUserProfileParams = z.infer<typeof getUserProfileParamsSchema>;

export const getUserProfileRelationshipSchema = z.object({
  relationshipType: z.enum(RelationshipType),
  friendedTime: z.date().nullish(),
  conversationId: conversationIdSchema().nullish(),
});

export type TGetUserProfileRelationship = z.infer<typeof getUserProfileRelationshipSchema>;

export const getUserProfileLatestFriendRequestSchema = z.object({
  friendRequestStatus: z.enum(FriendRequestStatus),
  friendRequestType: z.enum(FriendRequestType).nullable(),
});

export type TGetUserProfileLatestFriendRequest = z.infer<
  typeof getUserProfileLatestFriendRequestSchema
>;

export const getUserProfileVoSchema = findUserSchema.extend({
  userInfoBio: z.string().nullable(),
  relationships: z.array(getUserProfileRelationshipSchema),
  latestFriendRequest: getUserProfileLatestFriendRequestSchema.nullable(),
});

export type TGetUserProfileVo = z.infer<typeof getUserProfileVoSchema>;
