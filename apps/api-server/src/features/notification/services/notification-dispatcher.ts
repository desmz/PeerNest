import { Injectable } from '@nestjs/common';
import { TNotificationPayload } from '@peernest/core';

// import { NotificationTemplate } from './notification-template';

@Injectable()
export class NotificationDispatcher {
  constructor() {
    // private readonly gateway: NotificationGateway,
    // private readonly template: NotificationTemplate
  }

  // async dispatch(input: { type: string; recipientId: string; payload: any }) {
  //   const { title, body } = this.template.build(input.type, input.payload);

  //   const notification = await this.repo.create({
  //     notificationTypeName: input.type,
  //     recipientId: input.recipientId,
  //     title,
  //     body,
  //     payload: input.payload,
  //   });

  //   this.gateway.pushToUser(input.recipientId, notification);
  // }

  async dispatch(payload: TNotificationPayload<'commentReply'>) {
    console.log('dispatch a notification');
    console.log(payload);
  }
}
