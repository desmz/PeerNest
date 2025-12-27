import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCheckInWellnessMood,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CheckInWellnessMoodRepository {
  private static repoName = 'CHECK_IN_WELLNESS_MOOD_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createCheckInWellnessMoods(
    checkInWellnessMoodObjs: TInsertableCheckInWellnessMood[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const checkInWellnessMoods = await db
        .insertInto('checkInWellnessMood')
        .values(checkInWellnessMoodObjs)
        .returningAll()
        .execute();

      return checkInWellnessMoods;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessMoodRepository.repoName}] | Fail to create check in-wellness moods`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInWellnessMoodObjs }
      );
    }
  }

  async findWellnessMoodsByCheckInIds(checkInIds: string[], tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      if (checkInIds.length === 0) {
        return [];
      }

      const wellnessMoods = await db
        .selectFrom('checkInWellnessMood')
        .innerJoin(
          'wellnessMood',
          'wellnessMood.wellnessMoodId',
          'checkInWellnessMood.checkInWellnessMoodWellnessMoodId'
        )
        .where('checkInWellnessMood.checkInWellnessMoodCheckInId', 'in', checkInIds)
        .where('wellnessMood.wellnessMoodDeletedTime', 'is', null)
        .selectAll('wellnessMood')
        .select('checkInWellnessMood.checkInWellnessMoodCheckInId')
        .execute();

      return wellnessMoods;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessMoodRepository.repoName}] | Fail to find check in-wellness moods by check in ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInIds }
      );
    }
  }
}
