import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCheckInWellnessFactor,
  TKyselyTransaction,
} from '@peernest/db';

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
}
