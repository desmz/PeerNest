import { Injectable } from '@nestjs/common';
import { generateUserAchievementId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserAchievement,
  TKyselyTransaction,
} from '@peernest/db';

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

  async findAchievementsByUserId(
    userId: string,

    tx?: TKyselyTransaction
  ) {
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
}
