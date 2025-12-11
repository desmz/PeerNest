import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectableUniversity } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UniversityRepository {
  private static repoName = 'UNIVERSITY_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findUniversities(
    options?: {
      orderBy?: keyof TSelectableUniversity | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('university').selectAll();

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const universities = await query.execute();

      return universities;
    } catch (error) {
      throw new CustomHttpException(
        `[${UniversityRepository.repoName}] | Fail to find universities`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
