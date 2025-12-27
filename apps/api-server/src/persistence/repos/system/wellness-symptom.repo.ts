import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessSymptomRepository {
  private static repoName = 'WELLNESS_SYMPTOM_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

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
}
