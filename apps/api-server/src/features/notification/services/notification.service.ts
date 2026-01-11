import { Injectable } from '@nestjs/common';
import {
  TGetMyNotificationsQueryParams,
  TGetMyNotificationsVo,
  TMarkNotificationAsReadParams,
  TMarkNotificationsAsSeenRo,
  TNotification,
} from '@peernest/contract';
import { FindNotificationsSortOption, HttpErrorCode } from '@peernest/core';
import { TUpdatableNotification } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { NotificationRepository } from '@/persistence/repos/notification';
import { IClsStore } from '@/types/cls';

@Injectable()
export class NotificationService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,

    private readonly notificationRepository: NotificationRepository
  ) {}

  async getMyNotifications(
    getMyNotificationsQueryParams: TGetMyNotificationsQueryParams
  ): Promise<TGetMyNotificationsVo> {
    const { limit, offset, unReadonly } = getMyNotificationsQueryParams;
    const userId = this.clsService.get('user.id');

    const [notificationAggs, notificationCountObj, notificationUnReadCountObj] = await Promise.all([
      await this.notificationRepository.findNotificationAggsByUserId(userId, {
        limit: limit || undefined,
        offset: offset || undefined,
        orderBy: FindNotificationsSortOption.Newest,
        unReadonly: Boolean(unReadonly),
      }),
      await this.notificationRepository.getNotificationCountByUserId(userId),
      await this.notificationRepository.getNotificationCountByUserId(userId, { unReadonly: true }),
    ]);

    const formattedNotificationAggs: TNotification[] = notificationAggs.map((notificationAgg) => ({
      notificationId: notificationAgg.notificationId,
      notificationTitle: notificationAgg.notificationTitle,
      notificationBody: notificationAgg.notificationBody,
      notificationPayload: JSON.stringify(notificationAgg.notificationPayload),
      notificationCreatedTime: notificationAgg.notificationCreatedTime.toISOString(),
      notificationSeenTime: notificationAgg.notificationSeenTime?.toISOString() || null,
      notificationReadTime: notificationAgg.notificationReadTime?.toISOString() || null,
      notificationType: {
        notificationTypeId: notificationAgg.notificationTypeId,
        notificationTypeName: notificationAgg.notificationTypeName,
        notificationCategoryName: notificationAgg.notificationCategoryName,
      },
    }));

    return {
      meta: {
        count: notificationCountObj.notificationCount,
        unreadCount: notificationUnReadCountObj.notificationCount,
      },
      notifications: formattedNotificationAggs,
    };
  }

  async markNotificationsAsSeen(
    markNotificationsAsSeenRo: TMarkNotificationsAsSeenRo
  ): Promise<void> {
    const userId = this.clsService.get('user.id');
    const { notificationIds } = markNotificationsAsSeenRo;

    const now = new Date();
    if (notificationIds && notificationIds.length > 0) {
      await this.notificationRepository.updateNotificationsByIds(
        { notificationSeenTime: now },
        notificationIds,
        { notSeen: true }
      );
    } else {
      await this.notificationRepository.updateNotificationsByUserId(
        { notificationSeenTime: now },
        userId,
        { notSeen: true }
      );
    }
  }

  async markNotificationAsSRead(
    markNotificationAsReadParams: TMarkNotificationAsReadParams
  ): Promise<void> {
    const { notificationId } = markNotificationAsReadParams;

    const notification = await this.notificationRepository.findNotificationById(notificationId);

    if (!notification) {
      throw new CustomHttpException(
        `Notification ${notificationId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const notificationPayload: TUpdatableNotification = {
      notificationReadTime: now,
    };

    if (notification.notificationSeenTime === null) {
      notificationPayload.notificationSeenTime = now;
    }

    await this.notificationRepository.updateNotificationById(notificationPayload, notificationId, {
      unReadonly: true,
    });
  }
}
