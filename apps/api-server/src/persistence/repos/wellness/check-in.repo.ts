import { Injectable } from '@nestjs/common';
import { TGetMyWellnessCheckInsQueryParams } from '@peernest/contract';
import { generateCheckInId, HttpErrorCode, WellnessCheckInsSortOption } from '@peernest/core';
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
      from?: Date;
      to?: Date;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { from, to } = options || {};

      const checkIn = await db
        .selectFrom('checkIn')
        .select(this.checkInSelectBase)
        .where('checkInUserId', '=', userId)
        .where((eb) => {
          const effectiveTime = eb.fn('greatest', [
            'checkInCreatedTime',
            eb.fn.coalesce('checkInUpdatedTime', 'checkInCreatedTime'),
          ]);

          const fromCondition = from ? eb(effectiveTime, '>=', from) : eb.val(true);
          const toCondition = to ? eb(effectiveTime, '<=', to) : eb.val(true);

          return eb.and([fromCondition, toCondition]);
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

  async findCheckInsByUserId(
    userId: string,
    options?: TGetMyWellnessCheckInsQueryParams,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      console.log('sort', options?.sort);

      const {
        from,
        to,
        limit = 500,
        offset = 0,
        sort = WellnessCheckInsSortOption.Oldest,
      } = options || {};

      let query = db
        .selectFrom('checkIn')
        .select(this.checkInSelectBase)
        .where('checkInUserId', '=', userId)
        .where((eb) => {
          const effectiveTime = eb.fn('greatest', [
            'checkInCreatedTime',
            eb.fn.coalesce('checkInUpdatedTime', 'checkInCreatedTime'),
          ]);

          const fromCondition = from ? eb(effectiveTime, '>=', from) : eb.val(true);
          const toCondition = to ? eb(effectiveTime, '<=', to) : eb.val(true);

          return eb.and([fromCondition, toCondition]);
        });

      switch (sort) {
        case WellnessCheckInsSortOption.Newest:
          query = query.orderBy('checkInCreatedTime', 'desc');
          break;
        default:
          query = query.orderBy('checkInCreatedTime', 'asc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const checkIns = await query.execute();

      return checkIns;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInRepository.repoName}] | Fail to find check ins by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }
}
