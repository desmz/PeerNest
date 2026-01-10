export type TNotificationType =
  | 'commentReply'
  | 'friendRequestReceived'
  | 'friendRequestAccepted'
  | 'friendRequestRejected'
  | 'percherAdded'
  | 'percherReleased'
  | 'achievementUnlocked'
  | 'banRequestCreated'
  | 'banRequestApproved'
  | 'banRequestRejected'
  | 'userBanned'
  | 'userUnbanned'
  | 'roleChanged'
  | 'roleApplicationRejected';

type TNotificationFriendShipCategoryPayload = {
  fromUserId: string;
  toUserId: string;
  friendRequestId: string;
};

type TNotificationCounselorCategoryPayload = {
  counselorId: string;
  percherUserId: string;
  counselorUserId: string;
};

export type TNotificationPayloadMap = {
  commentReply: {
    discussionId: string;
    commentId: string;
    parentCommentId: string;
    replierId: string;
  };
  friendRequestReceived: TNotificationFriendShipCategoryPayload;
  friendRequestAccepted: TNotificationFriendShipCategoryPayload;
  friendRequestRejected: TNotificationFriendShipCategoryPayload;
  percherAdded: TNotificationCounselorCategoryPayload;
  percherReleased: TNotificationCounselorCategoryPayload;
  achievementUnlocked: {
    achievementId: string;
    achievementTitle: string;
  };
  banRequestCreated: {
    banRequestId: string;
    requesterId: string;
    bannedUserId: string;
  };
  banRequestApproved: {
    banRequestId: string;
    requesterId: string;
    bannedUserId: string;
    resolverId: string;
  };
  banRequestRejected: {
    banRequestId: string;
    requesterId: string;
    bannedUserId: string;
    resolverId: string;
  };
  userBanned: {
    banActionId: string;
    bannedUserId: string;
    bannedBy: string;
  };
  userUnbanned: {
    banActionId: string;
    unbannedUserId: string;
    unbannedBy: string;
  };
  roleChanged: {
    roleChangeActionId: string;
    oldRoleId: string;
    newRoleId: string;
  };
  roleApplicationRejected: {
    roleApplicationId: string;
    oldRoleId: string;
    newRoleId: string;
  };
};

export type TNotificationPayload<T extends TNotificationType> = TNotificationPayloadMap[T];

export type TNotificationPayloadUnion = TNotificationPayloadMap[keyof TNotificationPayloadMap];
