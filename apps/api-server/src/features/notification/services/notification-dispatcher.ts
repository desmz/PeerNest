import { Injectable } from '@nestjs/common';
import {
  generateNotificationId,
  TNotificationDispatchObj,
  TNotificationObj,
  TNotificationPayload,
  TNotificationType,
  TSocketRecipients,
} from '@peernest/core';
import { TInsertableNotification } from '@peernest/db';

import {
  NotificationRepository,
  NotificationTypeRepository,
} from '@/persistence/repos/notification';
import { UserRepository } from '@/persistence/repos/user';

import { NotificationGateway } from '../notification.gateway';

import { NotificationTemplate } from './notification-template';

@Injectable()
export class NotificationDispatcher {
  constructor(
    private readonly notificationGateway: NotificationGateway,
    private readonly notificationTemplate: NotificationTemplate,

    private readonly notificationRepository: NotificationRepository,
    private readonly notificationTypeRepository: NotificationTypeRepository,
    private readonly userRepository: UserRepository
  ) {}

  async dispatch<T extends TNotificationType>(dispatchObj: TNotificationDispatchObj<T>) {
    const { payload, recipients, type } = dispatchObj;
    const { body, title } = this.notificationTemplate.build(type, payload);

    const notificationObj = await this.processNotifications(recipients, type, {
      body,
      title,
      notificationPayload: payload,
    });

    this.notificationGateway.pushToUser(recipients, notificationObj);
  }

  private async processNotifications<T extends TNotificationType>(
    recipients: TSocketRecipients,
    type: TNotificationType,
    otherPayload: { body: string; title: string; notificationPayload: TNotificationPayload<T> }
  ) {
    const { roles = [], userIds = [] } = recipients;

    const [notificationType, usersWithRole] = await Promise.all([
      await this.notificationTypeRepository.findNotificationTypeByName(type),
      await this.userRepository.findUsersByRoleNames(roles),
    ]);

    if (!notificationType) {
      throw new Error(`Notification type ${type} is not found`);
    }

    const recipientIdsSet = new Set([
      ...userIds,
      ...usersWithRole.map((userWithRole) => userWithRole.userId),
    ]);

    const now = new Date();

    const insertableNotificationObjs: TInsertableNotification[] = Array.from(recipientIdsSet).map(
      (recipientId) => ({
        notificationId: generateNotificationId(),
        notificationNotificationTypeId: notificationType.notificationTypeId,
        notificationRecipientId: recipientId,
        notificationTitle: otherPayload.title,
        notificationBody: otherPayload.body,
        notificationPayload: otherPayload.notificationPayload,
        notificationCreatedTime: now,
      })
    );

    console.log({ insertableNotificationObjs, notificationType, usersWithRole });

    await this.notificationRepository.createNotifications(insertableNotificationObjs);

    const notificationObj: TNotificationObj<TNotificationType> = {
      notificationType: type,
      notificationTitle: otherPayload.title,
      notificationBody: otherPayload.body,
      notificationPayload: otherPayload.notificationPayload,
      notificationCreatedTime: now,
    };

    return notificationObj;
  }
}
