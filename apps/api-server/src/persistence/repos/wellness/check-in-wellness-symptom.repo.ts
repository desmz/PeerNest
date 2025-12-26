import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCheckInWellnessSymptom,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CheckInWellnessSymptomRepository {
  private static repoName = 'CHECK_IN_WELLNESS_SYMPTOM_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createCheckInWellnessSymptoms(
    checkInWellnessSymptomObjs: TInsertableCheckInWellnessSymptom[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const checkInWellnessSymptoms = await db
        .insertInto('checkInWellnessSymptom')
        .values(checkInWellnessSymptomObjs)
        .returningAll()
        .execute();

      return checkInWellnessSymptoms;
    } catch (error) {
      throw new CustomHttpException(
        `[${CheckInWellnessSymptomRepository.repoName}] | Fail to create check in-wellness symptoms`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, checkInWellnessSymptomObjs }
      );
    }
  }
}
