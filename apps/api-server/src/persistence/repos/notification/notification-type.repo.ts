import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class NotificationTypeRepository {
  private static repoName = 'NOTIFICATION_TYPE_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findNotificationTypeByName(
    name: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('notificationType')
        .selectAll()
        .where('notificationTypeName', '=', name);

      if (!options?.includedDeleted) {
        query = query.where('notificationTypeDeletedTime', 'is', null);
      }

      const notificationType = await query.executeTakeFirst();

      return notificationType;
    } catch (error) {
      throw new CustomHttpException(
        `[${NotificationTypeRepository.repoName}] | Fail to find notification type by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, name, options }
      );
    }
  }
}
