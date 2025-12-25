import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectableWellnessMood } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessMoodRepository {
  private static repoName = 'WELLNESS_MOOD_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

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
}
