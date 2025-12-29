import { Injectable } from '@nestjs/common';
import { generateWellnessFactorId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableWellnessFactor,
  TKyselyTransaction,
  TUpdatableWellnessFactor,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessFactorRepository {
  private static repoName = 'WELLNESS_FACTOR_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createWellnessFactor(
    wellnessFactorObj: TInsertableWellnessFactor,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = wellnessFactorObj.wellnessFactorCreatedTime
        ? wellnessFactorObj.wellnessFactorCreatedTime
        : new Date();

      const wellnessFactor = await db
        .insertInto('wellnessFactor')
        .values({
          ...wellnessFactorObj,
          wellnessFactorId: wellnessFactorObj.wellnessFactorId
            ? wellnessFactorObj.wellnessFactorId
            : generateWellnessFactorId(),
          wellnessFactorCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return wellnessFactor!;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to create wellness factor`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, wellnessFactorObj }
      );
    }
  }

  async updateWellnessFactorById(
    wellnessFactorPayload: TUpdatableWellnessFactor,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = wellnessFactorPayload.wellnessFactorUpdatedTime
        ? wellnessFactorPayload.wellnessFactorUpdatedTime
        : new Date();

      const wellnessFactor = await db
        .updateTable('wellnessFactor')
        .set({
          ...wellnessFactorPayload,
          wellnessFactorUpdatedTime: now,
        })
        .where('wellnessFactorId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return wellnessFactor!;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to update wellness factor by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, wellnessFactorPayload, id }
      );
    }
  }

  async findWellnessFactorById(
    id: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('wellnessFactor')
        .innerJoin(
          'wellnessFactorCategory',
          'wellnessFactorCategory.wellnessFactorCategoryId',
          'wellnessFactor.wellnessFactorWellnessFactorCategoryId'
        )
        .selectAll()
        .where('wellnessFactorId', '=', id);

      if (!options?.includedDeleted) {
        query = query.where('wellnessFactorDeletedTime', 'is', null);
      }

      const wellnessFactor = await query.executeTakeFirst();

      return wellnessFactor;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to find wellness factor by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findWellnessFactorByName(
    name: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('wellnessFactor')
        .innerJoin(
          'wellnessFactorCategory',
          'wellnessFactorCategory.wellnessFactorCategoryId',
          'wellnessFactor.wellnessFactorWellnessFactorCategoryId'
        )
        .selectAll()
        .where('wellnessFactorName', '=', name);

      if (!options?.includedDeleted) {
        query = query.where('wellnessFactorDeletedTime', 'is', null);
      }

      const wellnessFactor = await query.executeTakeFirst();

      return wellnessFactor;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to find wellness factor by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findWellnessFactors(
    options?: {
      includedDeleted?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted } = options || {};

      let query = db.selectFrom('wellnessFactor').selectAll();

      if (!includedDeleted) {
        query = query.where('wellnessFactorDeletedTime', 'is', null);
      }

      const wellnessFactors = await query.execute();

      return wellnessFactors;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to find wellness factors`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPosition(tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessFactor = await db
        .selectFrom('wellnessFactor')
        .select((eb) =>
          eb
            .cast<number>(eb.fn.max('wellnessFactorPosition'), 'bigint')
            .as('wellnessFactorMaxPosition')
        )
        .executeTakeFirst();

      const maxPos = wellnessFactor?.wellnessFactorMaxPosition
        ? wellnessFactor.wellnessFactorMaxPosition
        : -1;

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to find max position by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
