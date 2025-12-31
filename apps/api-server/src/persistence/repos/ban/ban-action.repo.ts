import { Injectable } from '@nestjs/common';
import { generateBanActionId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableBanAction, TKyselyTransaction } from '@peernest/db';

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
}
