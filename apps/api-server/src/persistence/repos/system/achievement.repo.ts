import { Injectable } from '@nestjs/common';
import { AchievementType, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class AchievementRepository {
  private static repoName = 'ACHIEVEMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findAchievements(
    options?: {
      isActive?: boolean;
      types?: AchievementType[];
      includedDeleted?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted, isActive, types } = options || {};

      let query = db.selectFrom('achievement').selectAll();

      if (!includedDeleted) {
        query = query.where('achievementDeletedTime', 'is', null);
      }

      if (isActive) {
        query = query.where('achievementIsActive', '=', isActive);
      }

      if (types && types.length > 0) {
        query = query.where('achievementType', 'in', types);
      }

      const achievements = await query.execute();

      return achievements;
    } catch (error) {
      throw new CustomHttpException(
        `[${AchievementRepository.repoName}] | Fail to find achievements`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
