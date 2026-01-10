import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
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
}
