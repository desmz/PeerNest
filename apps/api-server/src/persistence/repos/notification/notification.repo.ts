import { Injectable } from '@nestjs/common';
import { FindNotificationsSortOption, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableNotification,
  TKyselyTransaction,
  TUpdatableNotification,
} from '@peernest/db';

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

  async updateNotificationById(
    notificationPayload: TUpdatableNotification,
    id: string,
    options?: {
      unReadonly?: boolean;
      notSeen?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { notSeen, unReadonly } = options || {};

      let query = db
        .updateTable('notification')
        .set(notificationPayload)
        .where('notificationId', '=', id);

      if (unReadonly) {
        query = query.where('notificationReadTime', 'is', null);
      }

      if (notSeen) {
        query = query.where('notificationSeenTime', 'is', null);
      }

      const notification = await query.returningAll().executeTakeFirst();

      return notification!;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to update notification by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, notificationPayload, id }
      );
    }
  }

  async updateNotificationsByUserId(
    notificationPayload: TUpdatableNotification,
    userId: string,
    options?: {
      unReadonly?: boolean;
      notSeen?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { notSeen, unReadonly } = options || {};

      let query = db
        .updateTable('notification')
        .set(notificationPayload)
        .where('notificationRecipientId', '=', userId);

      if (unReadonly) {
        query = query.where('notificationReadTime', 'is', null);
      }

      if (notSeen) {
        query = query.where('notificationSeenTime', 'is', null);
      }

      const notifications = await query.returningAll().execute();

      return notifications!;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to update notifications by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, notificationPayload, userId, options }
      );
    }
  }

  async updateNotificationsByIds(
    notificationPayload: TUpdatableNotification,
    ids: string[],
    options?: {
      unReadonly?: boolean;
      notSeen?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { notSeen, unReadonly } = options || {};

      let query = db
        .updateTable('notification')
        .set(notificationPayload)
        .where('notificationId', 'in', ids);

      if (unReadonly) {
        query = query.where('notificationReadTime', 'is', null);
      }

      if (notSeen) {
        query = query.where('notificationSeenTime', 'is', null);
      }

      const notifications = await query.returningAll().execute();

      return notifications!;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to update notifications by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, notificationPayload, ids, options }
      );
    }
  }

  async findNotificationById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const notification = await db
        .selectFrom('notification')
        .where('notificationId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return notification!;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationRepository.repoName}] | Fail to find notification by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  async findNotificationAggsByUserId(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      unReadonly?: boolean;
      notSeen?: boolean;
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
        notSeen = false,
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

      if (notSeen) {
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
    options?: { unReadonly?: true; notSeen?: true },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { unReadonly = false, notSeen = false } = options || {};

      let query = db
        .selectFrom('notification')
        .select((eb) => [eb.fn.count<number>('notificationId').distinct().as('notificationCount')]);

      if (notSeen) {
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
