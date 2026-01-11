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
