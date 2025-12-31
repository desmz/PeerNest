import { Injectable } from '@nestjs/common';
import { generateBanActionId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableBanAction,
  TKyselyTransaction,
  TUpdatableBanAction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class BanActionRepository {
  private static repoName = 'BAN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createBanAction(banActionObj: TInsertableBanAction, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = banActionObj.banActionCreatedTime
        ? banActionObj.banActionCreatedTime
        : new Date();

      const banAction = await db
        .insertInto('banAction')
        .values({
          ...banActionObj,
          banActionId: banActionObj.banActionId ? banActionObj.banActionId : generateBanActionId(),
          banActionCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return banAction!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to create ban action`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banActionObj }
      );
    }
  }

  async updateBanActionById(
    banActionPayload: TUpdatableBanAction,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = banActionPayload.banActionUpdatedTime
        ? banActionPayload.banActionUpdatedTime
        : new Date();

      const banAction = await db
        .updateTable('banAction')
        .set({
          ...banActionPayload,
          banActionUpdatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return banAction!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to update ban action by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banActionPayload, id }
      );
    }
  }

  async validateIfUserIsBanned(bannedUserId: string, banEndTime: Date, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banAction = await db
        .selectFrom('banAction')
        .where('banActionBannedUserId', '=', bannedUserId)
        .where((eb) =>
          eb.or([
            eb('banActionBanEndTime', 'is', null),
            eb('banActionBanEndTime', '>=', banEndTime),
          ])
        )
        .selectAll()
        .executeTakeFirst();

      return banAction ? true : false;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to validate if user is banned`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, bannedUserId, banEndTime }
      );
    }
  }

  async findBanActionById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banAction = await db
        .selectFrom('banAction')
        .where('banActionId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return banAction;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to find ban action by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }
}
