import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AchievementType, generateUserAchievementId } from '@peernest/core';
import { TSelectableAchievement } from '@peernest/db';
import pLimit, { LimitFunction } from 'p-limit';

import { UserAchievementRepository } from '@/persistence/repos/achievement';
import { AchievementRepository } from '@/persistence/repos/system';
import { UserRepository } from '@/persistence/repos/user';

import { AchievementHandlersRegistry } from './achievement-handlers-registry';
import {
  TAchievementCriteriaType,
  TAchievementCriteriaUnion,
  TAchievementEvaluationContext,
} from './types';

@Injectable()
export class AchievementService {
  private readonly logger = new Logger(AchievementService.name);
  private isRunning = false; // running mutex lock

  // eslint-disable-next-line @typescript-eslint/naming-convention
  private static readonly CONCURRENCY_LIMIT = 16;
  private limit: LimitFunction;

  constructor(
    private readonly achievementHandlersRegistry: AchievementHandlersRegistry,

    private readonly achievementRepository: AchievementRepository,
    private readonly userRepository: UserRepository,
    private readonly userAchievementRepository: UserAchievementRepository
  ) {
    this.limit = pLimit(AchievementService.CONCURRENCY_LIMIT);
  }

  async evaluateImmediate(
    userId: string,
    criteriaTypes?: TAchievementCriteriaType[],
    context?: Omit<TAchievementEvaluationContext, 'userId'>
  ) {
    const achievements = await this.achievementRepository.findAchievements({
      isActive: true,
      types: [AchievementType.Immediate],
    });

    await this.processAchievementEvaluation(userId, achievements, criteriaTypes, context);
  }

  // @Cron(CronExpression.EVERY_DAY_AT_3AM) // 0 0 3 * * *
  @Cron(CronExpression.EVERY_10_SECONDS) // */10 * * * * *
  async evaluatePeriodic(criteriaTypes?: TAchievementCriteriaType[]) {
    if (this.isRunning) return;
    this.isRunning = true;

    try {
      this.logger.debug('Periodic achievements evaluation start...');

      const achievements = await this.achievementRepository.findAchievements({
        isActive: true,
        types: [AchievementType.Periodic],
      });

      const users = await this.userRepository.findUserBaseObjs();

      const context: Omit<TAchievementEvaluationContext, 'userId'> = {};

      await Promise.all(
        users.map((user) =>
          this.limit(async () => {
            try {
              await this.processAchievementEvaluation(
                user.userId,
                achievements,
                criteriaTypes,
                context
              );
            } catch (err) {
              this.logger.error(`User ${user.userId} failed`, err);
            }
          })
        )
      );

      this.logger.debug('Periodic achievements evaluation end...');
    } catch (error) {
      this.logger.error('Periodic achievements evaluation');
      console.error(error);
    } finally {
      this.isRunning = false;
    }
  }

  private async processAchievementEvaluation(
    userId: string,
    achievements: TSelectableAchievement[],
    criteriaTypes?: TAchievementCriteriaType[],
    context?: Omit<TAchievementEvaluationContext, 'userId'>
  ) {
    const earned = await this.userAchievementRepository.findUserAchievementsByUserId(userId);

    const earnedSet = new Set(earned.map((achievements) => achievements.achievementId));

    const now = new Date();
    for (const achievement of achievements) {
      if (earnedSet.has(achievement.achievementId)) continue;

      const criteria = achievement.achievementCriteria as TAchievementCriteriaUnion | null;

      if (criteria === null) continue;

      if (criteriaTypes && !criteriaTypes.includes(criteria.type)) continue;

      const achievementHandler =
        this.achievementHandlersRegistry.getAchievementHandlerByCriteriaType(criteria.type);

      if (!achievementHandler) continue;

      const refineContext = { userId, ...context };
      const isAchieved = await achievementHandler.evaluate(criteria, refineContext);

      if (isAchieved) {
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
