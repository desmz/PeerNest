import { Injectable } from '@nestjs/common';
import { generateWellnessSymptomId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableWellnessSymptom,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessSymptomRepository {
  private static repoName = 'WELLNESS_SYMPTOM_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createWellnessSymptom(
    wellnessSymptomObj: TInsertableWellnessSymptom,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = wellnessSymptomObj.wellnessSymptomCreatedTime
        ? wellnessSymptomObj.wellnessSymptomCreatedTime
        : new Date();

      const wellnessSymptom = await db
        .insertInto('wellnessSymptom')
        .values({
          ...wellnessSymptomObj,
          wellnessSymptomId: wellnessSymptomObj.wellnessSymptomId
            ? wellnessSymptomObj.wellnessSymptomId
            : generateWellnessSymptomId(),
          wellnessSymptomCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return wellnessSymptom!;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomRepository.repoName}] | Fail to create wellness symptom`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, wellnessSymptomObj }
      );
    }
  }

  async findWellnessSymptomByName(
    name: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('wellnessSymptom')
        .selectAll()
        .where('wellnessSymptomName', '=', name);

      if (!options?.includedDeleted) {
        query = query.where('wellnessSymptomDeletedTime', 'is', null);
      }

      const wellnessSymptom = await query.executeTakeFirst();

      return wellnessSymptom;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomRepository.repoName}] | Fail to find wellness symptom by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findWellnessSymptoms(
    options?: {
      includedDeleted?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted } = options || {};

      let query = db.selectFrom('wellnessSymptom').selectAll();

      if (!includedDeleted) {
        query = query.where('wellnessSymptomDeletedTime', 'is', null);
      }

      const wellnessSymptoms = await query.execute();

      return wellnessSymptoms;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomRepository.repoName}] | Fail to find wellness symptoms`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPosition(tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessSymptom = await db
        .selectFrom('wellnessSymptom')
        .select((eb) =>
          eb
            .cast<number>(eb.fn.max('wellnessSymptomPosition'), 'bigint')
            .as('wellnessSymptomMaxPosition')
        )
        .executeTakeFirst();

      const maxPos = wellnessSymptom?.wellnessSymptomMaxPosition
        ? wellnessSymptom.wellnessSymptomMaxPosition
        : -1;

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomRepository.repoName}] | Fail to find max position by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
