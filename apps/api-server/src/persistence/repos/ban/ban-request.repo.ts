import { Injectable } from '@nestjs/common';
import { BanRequestStatus, generateBanRequestId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableBanRequest,
  TKyselyTransaction,
  TUpdatableBanRequest,
} from '@peernest/db';

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

  async updateBanRequestById(
    banRequestPayload: TUpdatableBanRequest,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banRequest = await db
        .updateTable('banRequest')
        .set(banRequestPayload)
        .where('banRequestId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return banRequest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestRepository.repoName}] | Fail to update ban request by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banRequestPayload, id }
      );
    }
  }

  async updateBanRequestsByBannedUserId(
    banRequestPayload: TUpdatableBanRequest,
    bannedUserId: string,
    options?: { banRequestStatuses: BanRequestStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { banRequestStatuses } = options || {};

      let query = await db
        .updateTable('banRequest')
        .set(banRequestPayload)
        .where('banRequestBannedUserId', '=', bannedUserId);

      if (banRequestStatuses && banRequestStatuses.length > 0) {
        query = query.where('banRequestStatus', 'in', banRequestStatuses);
      }

      const banRequests = await query.returningAll().execute();

      return banRequests!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestRepository.repoName}] | Fail to update ban requests by banned user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banRequestPayload, bannedUserId }
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

  async findBanRequestByBannedId(
    id: string,
    options?: { banRequestStatuses: BanRequestStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { banRequestStatuses } = options || {};

      let query = db.selectFrom('banRequest').selectAll().where('banRequestId', '=', id);

      if (banRequestStatuses && banRequestStatuses.length > 0) {
        query = query.where('banRequestStatus', 'in', banRequestStatuses);
      }

      const banRequest = await query.executeTakeFirst();

      return banRequest;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanRequestRepository.repoName}] | Fail to find ban request by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }
}
