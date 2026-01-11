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
  banRequestId: string;
  requesterId: string;
  bannedUserId: string;
};

export type TBanRequestApprovedEvent = {
  banRequestId: string;
  requesterId: string;
  bannedUserId: string;
  resolverId: string;
};

export type TBanRequestRejectedEvent = {
  banRequestId: string;
  requesterId: string;
  bannedUserId: string;
  resolverId: string;
};

export type TUserBannedEvent = {
  banActionId: string;
  bannedUserId: string;
  bannedBy: string;
};

export type TUserUnbannedEvent = {
  banActionId: string;
  unbannedUserId: string;
  unbannedBy: string;
};

export type TRoleChangedEvent = {
  userId: string;
  roleChangeActionId: string;
  oldRoleId: string;
  newRoleId: string;
};

export type TRoleApplicationRejectedEvent = {
  userId: string;
  roleApplicationId: string;
  appliedRoleId: string;
};
