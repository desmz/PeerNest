import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class BanActionRepository {
  private static repoName = 'BAN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

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
