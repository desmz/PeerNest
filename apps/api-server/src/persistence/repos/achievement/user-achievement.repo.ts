import { Injectable } from '@nestjs/common';
import { generateUserAchievementId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserAchievement,
  TKyselyTransaction,
} from '@peernest/db';
import { jsonArrayFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserAchievementRepository {
  private static repoName = 'USER_ACHIEVEMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserAchievement(
    userAchievementObj: TInsertableUserAchievement,
    options?: { onConflictNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictNothing } = options || {};

      const now = userAchievementObj.userAchievementAwardedTime
        ? userAchievementObj.userAchievementAwardedTime
        : new Date();

      let query = db.insertInto('userAchievement').values({
        ...userAchievementObj,
        userAchievementId: userAchievementObj.userAchievementId
          ? userAchievementObj.userAchievementId
          : generateUserAchievementId(),
        userAchievementAwardedTime: now,
      });

      if (onConflictNothing) {
        query = query.onConflict((oc) =>
          oc.columns(['userAchievementUserId', 'userAchievementAchievementId']).doNothing()
        );
      }

      const userAchievement = await query.returningAll().executeTakeFirst();

      return userAchievement!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserAchievementRepository.repoName}] | Fail to create user-achievement`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userAchievementObj, options }
      );
    }
  }

  async findUserAchievementsByUserId(userId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userAchievements = await db
        .selectFrom('userAchievement')
        .innerJoin(
          'achievement',
          'achievement.achievementId',
          'userAchievement.userAchievementAchievementId'
        )
        .where('userAchievement.userAchievementUserId', '=', userId)
        .where('achievement.achievementIsActive', '=', true)
        .selectAll()
        .execute();

      return userAchievements;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserAchievementRepository.repoName}] | Fail to find user-achievements by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId }
      );
    }
  }

  // special case
  async getAchievementsByUserId(
    userId: string,
    options?: {
      orderBy?: 'position' | 'createdTime';
      ordering?: 'asc' | 'desc';
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { orderBy, ordering: givenOrdering } = options || {};
      const ordering = givenOrdering || 'asc';

      let query = db
        .selectFrom('achievementCategory')
        .selectAll('achievementCategory')
        .select((baseEb) => {
          let eb = baseEb
            .selectFrom('achievement')
            .leftJoin('userAchievement', (join) => {
              return join
                .onRef(
                  'userAchievement.userAchievementAchievementId',
                  '=',
                  'achievement.achievementId'
                )
                .on('userAchievement.userAchievementUserId', '=', userId);
            })
            .whereRef(
              'achievement.achievementAchievementCategoryId',
              '=',
              'achievementCategory.achievementCategoryId'
            )
            .where('achievement.achievementIsActive', '=', true)
            .where('achievement.achievementDeletedTime', 'is', null)
            .selectAll()
            .select((eb) =>
              eb.cast<string>('achievement.achievementPosition', 'text').as('achievementPosition')
            );

          if (orderBy === 'position') {
            eb = eb.orderBy('achievement.achievementPosition', ordering);
          } else {
            eb = eb.orderBy('achievement.achievementCreatedTime', ordering);
          }

          return jsonArrayFrom(eb).as('achievements');
        })
        .where('achievementCategoryDeletedTime', 'is', null);

      if (orderBy === 'position') {
        query = query.orderBy('achievementCategoryPosition', ordering);
      } else {
        query = query.orderBy('achievementCategoryCreatedTime', ordering);
      }

      const achievementAggs = await query.execute();

      return achievementAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserAchievementRepository.repoName}] | Fail to get achievements by userId`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
