import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCheckInWellnessFactor,
  TKyselyTransaction,
} from '@peernest/db';
import { sql } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CheckInWellnessFactorRepository {
  private static repoName = 'CHECK_IN_WELLNESS_FACTOR_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createCheckInWellnessFactors(
    checkInWellnessFactorObjs: TInsertableCheckInWellnessFactor[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const checkInWellnessFactors = await db
        .insertInto('checkInWellnessFactor')
        .values(checkInWellnessFactorObjs)
        .returningAll()
        .execute();

      return checkInWellnessFactors;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessFactorRepository.repoName}] | Fail to create check in-wellness factors`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInWellnessFactorObjs }
      );
    }
  }

  async findWellnessFactorsByCheckInId(checkInId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessFactors = await db
        .selectFrom('checkInWellnessFactor')
        .innerJoin(
          'wellnessFactor',
          'wellnessFactor.wellnessFactorId',
          'checkInWellnessFactor.checkInWellnessFactorWellnessFactorId'
        )
        .innerJoin(
          'wellnessFactorCategory',
          'wellnessFactorCategory.wellnessFactorCategoryId',
          'wellnessFactor.wellnessFactorWellnessFactorCategoryId'
        )
        .where('checkInWellnessFactor.checkInWellnessFactorCheckInId', '=', checkInId)
        .where('wellnessFactor.wellnessFactorDeletedTime', 'is', null)
        .where('wellnessFactorCategory.wellnessFactorCategoryDeletedTime', 'is', null)
        .selectAll(['wellnessFactor', 'wellnessFactorCategory'])
        .select('checkInWellnessFactor.checkInWellnessFactorCheckInId')
        .execute();

      return wellnessFactors;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessFactorRepository.repoName}] | Fail to find check in-wellness factors by check in id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInId }
      );
    }
  }

  async findWellnessFactorsByCheckInIds(checkInIds: string[], tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      if (checkInIds.length === 0) {
        return [];
      }

      const wellnessFactors = await db
        .selectFrom('checkInWellnessFactor')
        .innerJoin(
          'wellnessFactor',
          'wellnessFactor.wellnessFactorId',
          'checkInWellnessFactor.checkInWellnessFactorWellnessFactorId'
        )
        .innerJoin(
          'wellnessFactorCategory',
          'wellnessFactorCategory.wellnessFactorCategoryId',
          'wellnessFactor.wellnessFactorWellnessFactorCategoryId'
        )
        .where('checkInWellnessFactor.checkInWellnessFactorCheckInId', 'in', checkInIds)
        .where('wellnessFactor.wellnessFactorDeletedTime', 'is', null)
        .where('wellnessFactorCategory.wellnessFactorCategoryDeletedTime', 'is', null)
        .selectAll(['wellnessFactor', 'wellnessFactorCategory'])
        .select('checkInWellnessFactor.checkInWellnessFactorCheckInId')
        .execute();

      return wellnessFactors;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessFactorRepository.repoName}] | Fail to find check in-wellness factors by check in ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInIds }
      );
    }
  }

  async findWellnessFactorsByUserId(userId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessFactors = await db
        .selectFrom('checkIn')
        .innerJoin(
          'checkInWellnessFactor',
          'checkInWellnessFactor.checkInWellnessFactorCheckInId',
          'checkIn.checkInId'
        )
        .innerJoin(
          'wellnessFactor',
          'wellnessFactor.wellnessFactorId',
          'checkInWellnessFactor.checkInWellnessFactorWellnessFactorId'
        )
        .where('checkIn.checkInUserId', '=', userId)
        .selectAll('checkInWellnessFactor')
        .select([
          'checkInId',
          'checkInUserId',
          'checkInMoodRating',
          'checkInSleepQualityRating',
          sql<string | null>`check_in_sleep_time::text`.as('checkInSleepTime'),
          'checkInCheckInTime',
          'checkInCreatedTime',
          'checkInUpdatedTime',
        ])
        .distinctOn('checkInWellnessFactor.checkInWellnessFactorWellnessFactorId')
        .execute();

      return wellnessFactors;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessFactorRepository.repoName}] | Fail to find wellness factors by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  // special case
  /**
   *
   * @param userId
   * @param options
   * @param tx
   * @returns
   *
   * @description interval: [`from`, `to`)
   */
  async getWellnessFactorsSummary(
    userId: string,
    options: {
      from: Date;
      to: Date;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { from, to } = options;

      const wellnessFactorsSummary = await db
        .selectFrom('checkInWellnessFactor')
        .innerJoin(
          'checkIn',
          'checkIn.checkInId',
          'checkInWellnessFactor.checkInWellnessFactorCheckInId'
        )
        .innerJoin(
          'wellnessFactor',
          'wellnessFactor.wellnessFactorId',
          'checkInWellnessFactor.checkInWellnessFactorWellnessFactorId'
        )
        .where('checkIn.checkInUserId', '=', userId)
        .where('checkIn.checkInCheckInTime', '>=', from)
        .where('checkIn.checkInCheckInTime', '<', to)
        .groupBy([
          'wellnessFactor.wellnessFactorId',
          'wellnessFactor.wellnessFactorName',
          'wellnessFactor.wellnessFactorPosition',
        ])
        .orderBy('wellnessFactor.wellnessFactorPosition', 'asc')
        .select((eb) => [
          'wellnessFactor.wellnessFactorId',
          'wellnessFactor.wellnessFactorName',
          'wellnessFactor.wellnessFactorPosition',
          eb.fn.count<number>('wellnessFactor.wellnessFactorId').as('count'),
        ])
        .execute();

      return wellnessFactorsSummary;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessFactorRepository.repoName}] | Fail to get wellness factors summary`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
