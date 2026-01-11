import { Injectable } from '@nestjs/common';
import { FindNotificationsSortOption, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableNotification, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class NotificationRepository {
  private static repoName = 'NOTIFICATION_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createNotifications(notificationObjs: TInsertableNotification[], tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const notifications = await db
        .insertInto('notification')
        .values(notificationObjs)
        .returningAll()
        .execute();

      return notifications;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to create notifications`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, notificationObjs }
      );
    }
  }

  async findNotificationAggsByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unReadonly?: boolean;
      isSeen?: boolean;
      orderBy?: FindNotificationsSortOption;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const {
        limit = 20,
        offset = 0,
        unReadonly = false,
        isSeen = false,
        orderBy = FindNotificationsSortOption.Newest,
      } = options || {};

      let query = db
        .selectFrom('notification')
        .innerJoin(
          'notificationType',
          'notificationType.notificationTypeId',
          'notification.notificationNotificationTypeId'
        )
        .innerJoin(
          'notificationCategory',
          'notificationCategory.notificationCategoryId',
          'notificationTypeNotificationCategoryId'
        )
        .selectAll();

      if (isSeen) {
        query = query.where('notificationSeenTime', 'is', null);
      }

      if (unReadonly) {
        query = query.where('notificationReadTime', 'is', null);
      }

      switch (orderBy) {
        case FindNotificationsSortOption.Oldest:
          query = query.orderBy('notificationCreatedTime', 'asc');
          break;
        default:
          query = query.orderBy('notificationCreatedTime', 'desc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const notificationAggs = await query.execute();

      return notificationAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to find notification aggs by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId }
      );
    }
  }

  async getNotificationCountByUserId(
    userId: string,
    options?: { unReadonly?: true; isSeen?: true },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { unReadonly = false, isSeen = false } = options || {};

      let query = db
        .selectFrom('notification')
        .select((eb) => [eb.fn.count<number>('notificationId').distinct().as('notificationCount')]);

      if (isSeen) {
        query = query.where('notificationSeenTime', 'is', null);
      }

      if (unReadonly) {
        query = query.where('notificationReadTime', 'is', null);
      }

      const notificationCountObj = await query.executeTakeFirst();

      return notificationCountObj!;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to get notification count by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId }
      );
    }
  }
}
