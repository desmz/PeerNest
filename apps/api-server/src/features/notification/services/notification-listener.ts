import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENT } from '@peernest/core';

import {
  type TFriendRequestReceivedEvent,
  type TCommentReplyEvent,
  type TFriendRequestAcceptedEvent,
  type TFriendRequestRejectedEvent,
  type TPercherAddedEvent,
  type TPercherReleasedEvent,
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
}
