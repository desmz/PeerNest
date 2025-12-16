import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectablePronoun } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class PronounRepository {
  private static repoName = 'PRONOUN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findPronouns(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectablePronoun | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted, orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('pronoun').selectAll();

      if (!includedDeleted) {
        query = query.where('pronounDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const pronouns = await query.execute();

      return pronouns;
    } catch (error) {
      throw new CustomHttpException(
        `[${PronounRepository.repoName}] | Fail to find pronouns`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
