import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectableInterest } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class InterestRepository {
  private static repoName = 'INTEREST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findInterests(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectableInterest | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted, orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('interest').selectAll();

      if (!includedDeleted) {
        query = query.where('interestDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const interests = await query.execute();

      return interests;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to find interests`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
