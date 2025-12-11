import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectableDomain } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DomainRepository {
  private static repoName = 'PRONOUN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findDomains(
    options?: {
      orderBy?: keyof TSelectableDomain | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('domain').selectAll();

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const domains = await query.execute();

      return domains;
    } catch (error) {
      throw new CustomHttpException(
        `[${DomainRepository.repoName}] | Fail to find domains`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
