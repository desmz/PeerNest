import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENT, UserRole } from '@peernest/core';

import {
  type TFriendRequestReceivedEvent,
  type TCommentReplyEvent,
  type TFriendRequestAcceptedEvent,
  type TFriendRequestRejectedEvent,
  type TPercherAddedEvent,
  type TPercherReleasedEvent,
  type TAchievementUnlockedEvent,
  type TBanRequestCreatedEvent,
  type TBanRequestRejectedEvent,
  type TBanRequestApprovedEvent,
  type TUserBannedEvent,
} from '@/features/domain/events';

import { NotificationDispatcher } from './notification-dispatcher';

@Injectable()
export class NotificationListener {
  constructor(private readonly dispatcher: NotificationDispatcher) {}

  @OnEvent(NOTIFICATION_EVENT.COMMENT_REPLY)
  async onCommentReply(event: TCommentReplyEvent) {
    await this.dispatcher.dispatch({
      type: 'commentReply',
      recipients: {
        userIds: [event.parentAuthorId],
      },
      payload: {
        discussionId: event.discussionId,
        commentId: event.replyCommentId,
        parentCommentId: event.parentCommentId,
        replierId: event.replierId,
      },
    });
  }

  @OnEvent(NOTIFICATION_EVENT.FRIEND_REQUEST)
  async onFriendRequestReceived(event: TFriendRequestReceivedEvent) {
    await this.dispatcher.dispatch({
      type: 'friendRequestReceived',
      recipients: {
        userIds: [event.toUserId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.FRIEND_ACCEPTED)
  async onFriendRequestAccepted(event: TFriendRequestAcceptedEvent) {
    await this.dispatcher.dispatch({
      type: 'friendRequestAccepted',
      recipients: {
        userIds: [event.fromUserId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.FRIEND_REJECTED)
  async onFriendRequestRejected(event: TFriendRequestRejectedEvent) {
    await this.dispatcher.dispatch({
      type: 'friendRequestRejected',
      recipients: {
        userIds: [event.fromUserId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.PERCHER_ADDED)
  async onPercherAdded(event: TPercherAddedEvent) {
    await this.dispatcher.dispatch({
      type: 'percherAdded',
      recipients: {
        userIds: [event.percherUserId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.PERCHER_RELEASED)
  async onPercherReleased(event: TPercherReleasedEvent) {
    await this.dispatcher.dispatch({
      type: 'percherReleased',
      recipients: {
        userIds: [event.percherUserId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.ACHIEVEMENT_UNLOCKED)
  async onAchievementUnlocked(event: TAchievementUnlockedEvent) {
    await this.dispatcher.dispatch({
      type: 'achievementUnlocked',
      recipients: {
        userIds: [event.userId],
      },
      payload: {
        achievementId: event.achievementId,
        achievementTitle: event.achievementTitle,
      },
    });
  }

  @OnEvent(NOTIFICATION_EVENT.BAN_REQUEST_CREATED)
  async onBanRequestCreated(event: TBanRequestCreatedEvent) {
    await this.dispatcher.dispatch({
      type: 'banRequestCreated',
      recipients: {
        roles: [UserRole.Admin],
      },
      payload: {
        banRequestId: event.banRequestId,
        requesterId: event.requesterId,
        bannedUserId: event.bannedUserId,
      },
    });
  }

  @OnEvent(NOTIFICATION_EVENT.BAN_APPROVED)
  async onBanRequestApproved(event: TBanRequestApprovedEvent) {
    await this.dispatcher.dispatch({
      type: 'banRequestApproved',
      recipients: {
        userIds: [event.requesterId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.BAN_REJECTED)
  async onBanRequestRejected(event: TBanRequestRejectedEvent) {
    await this.dispatcher.dispatch({
      type: 'banRequestRejected',
      recipients: {
        userIds: [event.requesterId],
      },
      payload: event,
    });
  }

  @OnEvent(NOTIFICATION_EVENT.USER_BANNED)
  async onUserBanned(event: TUserBannedEvent) {
    await this.dispatcher.dispatch({
      type: 'userBanned',
      recipients: {
        roles: [UserRole.Moderator, UserRole.Admin],
      },
      payload: {
        banActionId: event.banActionId,
        bannedUserId: event.bannedUserId,
        bannedBy: event.bannedBy,
      },
    });
  }
}
