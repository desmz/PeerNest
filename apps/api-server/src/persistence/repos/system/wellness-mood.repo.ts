import { Injectable } from '@nestjs/common';
import { generateWellnessMoodId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableWellnessMood,
  TKyselyTransaction,
  TSelectableWellnessMood,
  TUpdatableWellnessMood,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessMoodRepository {
  private static repoName = 'WELLNESS_MOOD_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createWellnessMood(wellnessMoodObj: TInsertableWellnessMood, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = wellnessMoodObj.wellnessMoodCreatedTime
        ? wellnessMoodObj.wellnessMoodCreatedTime
        : new Date();

      const wellnessMood = await db
        .insertInto('wellnessMood')
        .values({
          ...wellnessMoodObj,
          wellnessMoodId: wellnessMoodObj.wellnessMoodId
            ? wellnessMoodObj.wellnessMoodId
            : generateWellnessMoodId(),
          wellnessMoodCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return wellnessMood!;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to create wellness mood`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, wellnessMoodObj }
      );
    }
  }

  async updateWellnessMoodById(
    wellnessMoodPayload: TUpdatableWellnessMood,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = wellnessMoodPayload.wellnessMoodUpdatedTime
        ? wellnessMoodPayload.wellnessMoodUpdatedTime
        : new Date();

      const wellnessMood = await db
        .updateTable('wellnessMood')
        .set({
          ...wellnessMoodPayload,
          wellnessMoodUpdatedTime: now,
        })
        .where('wellnessMoodId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return wellnessMood!;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to update wellness mood by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, wellnessMoodPayload, id }
      );
    }
  }

  async findWellnessMoodById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessMood = await db
        .selectFrom('wellnessMood')
        .where('wellnessMoodId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return wellnessMood;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to find wellness mood by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async findWellnessMoodByName(name: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessMood = await db
        .selectFrom('wellnessMood')
        .where('wellnessMoodName', '=', name)
        .selectAll()
        .executeTakeFirst();

      return wellnessMood;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to find wellness mood by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async findWellnessMoods(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectableWellnessMood | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted, orderBy, ordering } = options || {};

      let query = db.selectFrom('wellnessMood').selectAll();

      if (!includedDeleted) {
        query = query.where('wellnessMoodDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const wellnessMoods = await query.execute();

      return wellnessMoods;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to find wellness moods`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPosition(tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const wellnessMood = await db
        .selectFrom('wellnessMood')
        .select((eb) =>
          eb.cast<number>(eb.fn.max('wellnessMoodPosition'), 'bigint').as('wellnessMoodMaxPosition')
        )
        .executeTakeFirst();

      const maxPos = wellnessMood?.wellnessMoodMaxPosition
        ? wellnessMood.wellnessMoodMaxPosition
        : -1;

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessMoodRepository.repoName}] | Fail to find max position by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
