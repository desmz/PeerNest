import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessFactorRepository {
  private static repoName = 'WELLNESS_FACTOR_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

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
}
