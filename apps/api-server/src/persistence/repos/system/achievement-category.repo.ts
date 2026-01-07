import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class AchievementCategoryRepository {
  private static repoName = 'ACHIEVEMENT_CATEGORY_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findAchievementCategoryAggs(
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
        .selectFrom('achievementCategory')
        .selectAll('achievementCategory')
        .select((baseEb) => {
          let eb = baseEb
            .selectFrom('achievement')
            .whereRef(
              'achievement.achievementAchievementCategoryId',
              '=',
              'achievementCategory.achievementCategoryId'
            )
            .selectAll('achievement')
            .select((eb) =>
              eb.cast<string>('achievement.achievementPosition', 'text').as('achievementPosition')
            );

          if (orderBy === 'position') {
            eb = eb.orderBy('achievement.achievementPosition', ordering);
          } else {
            eb = eb.orderBy('achievement.achievementCreatedTime', ordering);
          }

          return jsonArrayFrom(eb).as('achievements');
        });

      if (!includedDeleted) {
        query = query.where('achievementCategoryDeletedTime', 'is', null);
      }

      if (orderBy === 'position') {
        query = query.orderBy('achievementCategoryPosition', ordering);
      } else {
        query = query.orderBy('achievementCategoryCreatedTime', ordering);
      }

      const achievementAggs = await query.execute();

      return achievementAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${AchievementCategoryRepository.repoName}] | Fail to find achievement category aggs`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
