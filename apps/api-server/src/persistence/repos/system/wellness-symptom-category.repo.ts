import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class WellnessSymptomCategoryRepository {
  private static repoName = 'WELLNESS_SYMPTOM_CATEGORY_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findWellnessSymptomCategoryById(
    id: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('wellnessSymptomCategory')
        .selectAll()
        .where('wellnessSymptomCategoryId', '=', id);

      if (!options?.includedDeleted) {
        query = query.where('wellnessSymptomCategoryDeletedTime', 'is', null);
      }

      const wellnessSymptomCategory = await query.executeTakeFirst();

      return wellnessSymptomCategory;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomCategoryRepository.repoName}] | Fail to find wellness symptom category by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findWellnessSymptomCategoryAggs(
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
        .selectFrom('wellnessSymptomCategory')
        .selectAll('wellnessSymptomCategory')
        .select((baseEb) => {
          let eb = baseEb
            .selectFrom('wellnessSymptom')
            .whereRef(
              'wellnessSymptom.wellnessSymptomWellnessSymptomCategoryId',
              '=',
              'wellnessSymptomCategory.wellnessSymptomCategoryId'
            )
            .selectAll('wellnessSymptom')
            .select((eb) =>
              eb
                .cast<string>('wellnessSymptom.wellnessSymptomPosition', 'text')
                .as('wellnessSymptomPosition')
            );

          if (orderBy === 'position') {
            eb = eb.orderBy('wellnessSymptom.wellnessSymptomPosition', ordering);
          } else {
            eb = eb.orderBy('wellnessSymptom.wellnessSymptomCreatedTime', ordering);
          }

          return jsonArrayFrom(eb).as('wellnessSymptoms');
        });

      if (!includedDeleted) {
        query = query.where('wellnessSymptomCategoryDeletedTime', 'is', null);
      }

      if (orderBy === 'position') {
        query = query.orderBy('wellnessSymptomCategoryPosition', ordering);
      } else {
        query = query.orderBy('wellnessSymptomCategoryCreatedTime', ordering);
      }

      const wellnessSymptomAggs = await query.execute();

      return wellnessSymptomAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${WellnessSymptomCategoryRepository.repoName}] | Fail to find wellness symptom category aggs`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
