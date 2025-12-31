import { Injectable } from '@nestjs/common';
import { BanRequestStatus, generateBanRequestId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableBanRequest, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class BanRequestRepository {
  private static repoName = 'BAN_REQUEST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createBanRequest(banRequestObj: TInsertableBanRequest, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = banRequestObj.banRequestCreatedTime
        ? banRequestObj.banRequestCreatedTime
        : new Date();

      const banRequest = await db
        .insertInto('banRequest')
        .values({
          ...banRequestObj,
          banRequestId: banRequestObj.banRequestId
            ? banRequestObj.banRequestId
            : generateBanRequestId(),
          banRequestCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return banRequest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestRepository.repoName}] | Fail to create ban request`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banRequestObj }
      );
    }
  }

  async findBanRequestByBannedUserId(
    bannedUserId: string,
    options?: { banRequestStatuses: BanRequestStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { banRequestStatuses } = options || {};

      let query = db
        .selectFrom('banRequest')
        .selectAll()
        .where('banRequestBannedUserId', '=', bannedUserId);

      if (banRequestStatuses && banRequestStatuses.length > 0) {
        query = query.where('banRequestStatus', 'in', banRequestStatuses);
      }

      const banRequest = await query.executeTakeFirst();

      return banRequest;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestRepository.repoName}] | Fail to find ban request by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, bannedUserId, options }
      );
    }
  }
}
