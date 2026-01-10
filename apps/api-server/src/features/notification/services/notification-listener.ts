import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENT } from '@peernest/core';

import { type TCommentReplyEvent } from '@/features/domain/events';

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
}
