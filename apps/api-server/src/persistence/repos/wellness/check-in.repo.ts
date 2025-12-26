import { Injectable } from '@nestjs/common';
import { generateCheckInId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableCheckIn, TKyselyTransaction } from '@peernest/db';
import { sql } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CheckInRepository {
  private static repoName = 'CHECK_IN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  private checkInSelectBase = [
    'checkInId',
    'checkInUserId',
    'checkInMoodRating',
    'checkInSleepQualityRating',
    sql<string | null>`check_in_sleep_time::text`.as('checkInSleepTime'),
    'checkInCheckInTime',
    'checkInCreatedTime',
    'checkInUpdatedTime',
  ] as const;

  async createCheckIn(checkInObj: TInsertableCheckIn, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = checkInObj.checkInCreatedTime ? checkInObj.checkInCreatedTime : new Date();

      const checkIn = await db
        .insertInto('checkIn')
        .values({
          ...checkInObj,
          checkInId: checkInObj.checkInId ? checkInObj.checkInId : generateCheckInId(),
          checkInCreatedTime: now,
        })
        .returning(this.checkInSelectBase)
        .executeTakeFirst();

      return checkIn!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInRepository.repoName}] | Fail to create check in`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInObj }
      );
    }
  }

  async findCheckInByUserId(
    userId: string,
    options?: {
      startDate?: Date;
      endDate?: Date;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { startDate, endDate } = options || {};

      const checkIn = await db
        .selectFrom('checkIn')
        .select(this.checkInSelectBase)
        .where('checkInUserId', '=', userId)
        .where((eb) => {
          const effectiveTime = eb.fn('greatest', [
            'checkInCreatedTime',
            eb.fn.coalesce('checkInUpdatedTime', 'checkInCreatedTime'),
          ]);

          const startDateCondition = startDate ? eb(effectiveTime, '>=', startDate) : eb.val(true);
          const endDateCondition = endDate ? eb(effectiveTime, '<=', endDate) : eb.val(true);

          return eb.and([startDateCondition, endDateCondition]);
        })
        .executeTakeFirst();

      return checkIn;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInRepository.repoName}] | Fail to find check in by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }
}
