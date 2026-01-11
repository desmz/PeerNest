import { UserRole } from '@peernest/core';

export type TCommentReplyEvent = {
  replyCommentId: string;
  parentCommentId: string;
  discussionId: string;
  replierId: string;
  parentAuthorId: string;
};

export type TFriendRequestReceivedEvent = {
  fromUserId: string;
  toUserId: string;
  friendRequestId: string;
};

export type TFriendRequestAcceptedEvent = {
  fromUserId: string;
  toUserId: string;
  friendRequestId: string;
};

export type TFriendRequestRejectedEvent = {
  fromUserId: string;
  toUserId: string;
  friendRequestId: string;
};

export type TPercherAddedEvent = {
  counselorId: string;
  percherUserId: string;
  counselorUserId: string;
};

export type TPercherReleasedEvent = {
  counselorId: string;
  percherUserId: string;
  counselorUserId: string;
};

export type TAchievementUnlockedEvent = {
  userId: string;
  achievementId: string;
  achievementTitle: string;
};

export type TBanRequestCreatedEvent = {
  roles: UserRole[];
  banRequestId: string;
  requesterId: string;
  bannedUserId: string;
};
