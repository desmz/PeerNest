import { Injectable } from '@nestjs/common';
import { generateCheckInHealthMeasurementId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCheckInHealthMeasurement,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CheckInHealthMeasurementRepository {
  private static repoName = 'CHECK_IN_HEALTH_MEASUREMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createCheckInHealthMeasurement(
    checkInHealthMeasurementObj: TInsertableCheckInHealthMeasurement,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const checkInHealthMeasurement = await db
        .insertInto('checkInHealthMeasurement')
        .values({
          ...checkInHealthMeasurementObj,
          checkInHealthMeasurementId: checkInHealthMeasurementObj.checkInHealthMeasurementId
            ? checkInHealthMeasurementObj.checkInHealthMeasurementId
            : generateCheckInHealthMeasurementId(),
        })
        .returningAll()
        .executeTakeFirst();

      return checkInHealthMeasurement;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to create check in health measurement`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInHealthMeasurementObj }
      );
    }
  }

  async findCheckInMeasurementByCheckInId(checkInId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const checkInMeasurements = await db
        .selectFrom('checkInHealthMeasurement')
        .where('checkInHealthMeasurement.checkInHealthMeasurementCheckInId', '=', checkInId)
        .selectAll()
        .executeTakeFirst();

      return checkInMeasurements;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to find check in health measurement by check in id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInId }
      );
    }
  }

  async findCheckInMeasurementsByCheckInIds(checkInIds: string[], tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      if (checkInIds.length === 0) {
        return [];
      }

      const checkInMeasurements = await db
        .selectFrom('checkInHealthMeasurement')
        .where('checkInHealthMeasurement.checkInHealthMeasurementCheckInId', 'in', checkInIds)
        .selectAll()
        .execute();

      return checkInMeasurements;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to find check in health measurements by check in ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInIds }
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
  async getHeartRateTrend(
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

      const heartRateTrends = await db
        .selectFrom('checkInHealthMeasurement')
        .innerJoin(
          'checkIn',
          'checkIn.checkInId',
          'checkInHealthMeasurement.checkInHealthMeasurementCheckInId'
        )
        .where('checkIn.checkInUserId', '=', userId)
        .where('checkIn.checkInCheckInTime', '>=', from)
        .where('checkIn.checkInCheckInTime', '<', to)
        .select((eb) => [
          'checkIn.checkInCheckInTime',
          eb
            .cast<number>(
              eb.fn.avg('checkInHealthMeasurement.checkInHealthMeasurementHeartRate'),
              'double precision'
            )
            .as('value'),
        ])
        .groupBy('checkIn.checkInCheckInTime')
        .orderBy('checkIn.checkInCheckInTime', 'asc')
        .execute();

      return heartRateTrends;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to get heart rate trend`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }

  /**
   *
   * @param userId
   * @param options
   * @param tx
   * @returns
   *
   * @description interval: [`from`, `to`)
   */
  async getStepCountTrend(
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

      const stepCountTrends = await db
        .selectFrom('checkInHealthMeasurement')
        .innerJoin(
          'checkIn',
          'checkIn.checkInId',
          'checkInHealthMeasurement.checkInHealthMeasurementCheckInId'
        )
        .where('checkIn.checkInUserId', '=', userId)
        .where('checkIn.checkInCheckInTime', '>=', from)
        .where('checkIn.checkInCheckInTime', '<', to)
        .select((eb) => [
          'checkIn.checkInCheckInTime',
          eb
            .cast<number>(
              eb.fn.avg('checkInHealthMeasurement.checkInHealthMeasurementStepCount'),
              'double precision'
            )
            .as('value'),
        ])
        .groupBy('checkIn.checkInCheckInTime')
        .orderBy('checkIn.checkInCheckInTime', 'asc')
        .execute();

      return stepCountTrends;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to get step count trend`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }

  /**
   *
   * @param userId
   * @param options
   * @param tx
   * @returns
   *
   * @description interval: [`from`, `to`)
   */
  async getWeightTrend(
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

      const weightTrends = await db
        .selectFrom('checkInHealthMeasurement')
        .innerJoin(
          'checkIn',
          'checkIn.checkInId',
          'checkInHealthMeasurement.checkInHealthMeasurementCheckInId'
        )
        .where('checkIn.checkInUserId', '=', userId)
        .where('checkIn.checkInCheckInTime', '>=', from)
        .where('checkIn.checkInCheckInTime', '<', to)
        .select((eb) => [
          'checkIn.checkInCheckInTime',
          eb
            .cast<number>(
              eb.fn.avg('checkInHealthMeasurement.checkInHealthMeasurementWeight'),
              'double precision'
            )
            .as('value'),
        ])
        .groupBy('checkIn.checkInCheckInTime')
        .orderBy('checkIn.checkInCheckInTime', 'asc')
        .execute();

      return weightTrends;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInHealthMeasurementRepository.repoName}] | Fail to get weight trend`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }
}
