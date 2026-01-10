import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NOTIFICATION_EVENT, type TNotificationPayload } from '@peernest/core';

import { NotificationDispatcher } from './notification-dispatcher';

@Injectable()
export class NotificationListener {
  constructor(private readonly dispatcher: NotificationDispatcher) {}

  @OnEvent(NOTIFICATION_EVENT.COMMENT_REPLY)
  async onCommentReply(payload: TNotificationPayload<'commentReply'>) {
    console.log('inside on comment reply', payload);
    await this.dispatcher.dispatch(payload);
    // await this.dispatcher.dispatch({
    //   type: 'comment_reply',
    //   recipientId: payload.commentAuthorId,
    //   payload,
    // });
  }

  // @OnEvent(NOTIFICATION_EVENT.ACHIEVEMENT_UNLOCKED)
  // async onAchievement(payload) {
  //   await this.dispatcher.dispatch({
  //     type: 'achievement_unlocked',
  //     recipientId: payload.userId,
  //     payload,
  //   });
  // }

  // pattern continues for all events
}
