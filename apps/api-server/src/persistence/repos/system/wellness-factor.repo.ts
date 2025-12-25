import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessFactorRepository {
  private static repoName = 'WELLNESS_FACTOR_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findWellnessFactorAggs(
    options?: {
      includedDeleted?: boolean;
      orderBy?: 'position' | 'createdTime';
      ordering?: 'asc' | 'desc';
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted, orderBy, ordering: givenOrdering } = options || {};
      const ordering = givenOrdering || 'asc';

      let query = db
        .selectFrom('wellnessFactorCategory')
        .selectAll('wellnessFactorCategory')
        .select((baseEb) => {
          let eb = baseEb
            .selectFrom('wellnessFactor')
            .whereRef(
              'wellnessFactor.wellnessFactorWellnessFactorCategoryId',
              '=',
              'wellnessFactorCategory.wellnessFactorCategoryId'
            )
            .selectAll('wellnessFactor')
            .select((eb) =>
              eb
                .cast<string>('wellnessFactor.wellnessFactorPosition', 'text')
                .as('wellnessFactorPosition')
            );

          if (orderBy === 'position') {
            eb = eb.orderBy('wellnessFactor.wellnessFactorPosition', ordering);
          } else {
            eb = eb.orderBy('wellnessFactor.wellnessFactorCreatedTime', ordering);
          }

          return jsonArrayFrom(eb).as('wellnessFactors');
        });

      if (!includedDeleted) {
        query = query.where('wellnessFactorCategoryDeletedTime', 'is', null);
      }

      if (orderBy === 'position') {
        query = query.orderBy('wellnessFactorCategoryPosition', ordering);
      } else {
        query = query.orderBy('wellnessFactorCategoryCreatedTime', ordering);
      }

      const wellnessFactorAggs = await query.execute();

      return wellnessFactorAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessFactorRepository.repoName}] | Fail to find wellness factor aggs`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
