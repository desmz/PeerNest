import { Injectable } from '@nestjs/common';

import { CheckInRepository } from '@/persistence/repos/wellness';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class MainWellnessWellnessStreakHandler extends AchievementHandler<'maintainWellnessStreak'> {
  constructor(private readonly checkInRepository: CheckInRepository) {
    super();
  }

  readonly criteriaType = 'maintainWellnessStreak';

  async evaluate(
    criteria: TAchievementCriteria<'maintainWellnessStreak'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { streaks } = criteria;
    const { userId } = context;

    const isAchieved = await this.checkInRepository.hasConsecutiveCheckInStreak(userId, streaks);

    return isAchieved;
  }
}
