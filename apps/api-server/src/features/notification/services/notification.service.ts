import { Injectable } from '@nestjs/common';
import {
  TGetMyNotificationsQueryParams,
  TGetMyNotificationsVo,
  TNotification,
} from '@peernest/contract';
import { FindNotificationsSortOption } from '@peernest/core';
import { ClsService } from 'nestjs-cls';

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
}
