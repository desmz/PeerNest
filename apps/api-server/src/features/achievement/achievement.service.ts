import { Injectable } from '@nestjs/common';
import { AchievementType, generateUserAchievementId } from '@peernest/core';

import { UserAchievementRepository } from '@/persistence/repos/achievement';
import { AchievementRepository } from '@/persistence/repos/system';

import { AchievementHandlersRegistry } from './achievement-handlers-registry';
import { TAchievementCriteriaType, TAchievementCriteriaUnion } from './types';

@Injectable()
export class AchievementService {
  constructor(
    private readonly achievementHandlersRegistry: AchievementHandlersRegistry,

    private readonly achievementRepository: AchievementRepository,
    private readonly userAchievementRepository: UserAchievementRepository
  ) {}

  async evaluateImmediate(userId: string, criteriaType?: TAchievementCriteriaType) {
    const achievements = await this.achievementRepository.findAchievements({
      isActive: true,
      types: [AchievementType.Immediate],
    });

    const earned = await this.userAchievementRepository.findUserAchievementsByUserId(userId);

    const earnedSet = new Set(earned.map((achievements) => achievements.achievementId));

    const now = new Date();
    for (const achievement of achievements) {
      if (earnedSet.has(achievement.achievementId)) continue;

      const criteria = achievement.achievementCriteria as TAchievementCriteriaUnion | null;

      if (criteria === null) continue;

      if (criteriaType && criteriaType !== criteria.type) continue;

      const achievementHandler =
        this.achievementHandlersRegistry.getAchievementHandlerByCriteriaType(criteria.type);

      if (!achievementHandler) continue;

      const isPassed = await achievementHandler.evaluate(userId, criteria);

      if (isPassed) {
        await this.userAchievementRepository.createUserAchievement(
          {
            userAchievementId: generateUserAchievementId(),
            userAchievementUserId: userId,
            userAchievementAchievementId: achievement.achievementId,
            userAchievementAwardedTime: now,
          },
          { onConflictNothing: true }
        );

        // todo: send notification to the user
      }
    }
  }
}
