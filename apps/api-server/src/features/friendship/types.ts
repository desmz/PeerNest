import { FriendRequestStatus } from '@peernest/core';

export type TGetFriendRequestsByUserIdOptions = {
  friendRequestFromId?: string;
  friendRequestToId?: string;
  friendRequestStatus?: FriendRequestStatus;
};
