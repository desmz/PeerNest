import { Injectable } from '@nestjs/common';

import { WellnessFactorRepository } from '@/persistence/repos/system';
import { CheckInWellnessFactorRepository } from '@/persistence/repos/wellness';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class CoverAllWellnessFactorsHandler extends AchievementHandler<'coverAllWellnessFactors'> {
  constructor(
    private readonly checkInWellnessFactorRepository: CheckInWellnessFactorRepository,
    private readonly wellnessFactorRepository: WellnessFactorRepository
  ) {
    super();
  }

  readonly criteriaType = 'coverAllWellnessFactors';

  async evaluate(
    criteria: TAchievementCriteria<'coverAllWellnessFactors'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { coverage } = criteria;
    const { userId } = context;

    const [systemWellnessFactors, userWellnessFactors] = await Promise.all([
      await this.wellnessFactorRepository.findWellnessFactors(),
      await this.checkInWellnessFactorRepository.findWellnessFactorsByUserId(userId),
    ]);

    const systemWellnessFactorsSet = new Set(
      systemWellnessFactors.map((wellnessFactor) => wellnessFactor.wellnessFactorId)
    );
    const userWellnessFactorsSet = new Set(
      userWellnessFactors.map(
        (wellnessFactor) => wellnessFactor.checkInWellnessFactorWellnessFactorId
      )
    );

    const intersectedWellnessFactors = [];
    for (const userWellnessFactor of userWellnessFactorsSet) {
      if (systemWellnessFactorsSet.has(userWellnessFactor)) {
        intersectedWellnessFactors.push(systemWellnessFactors);
      }
    }

    if (coverage === 'all') {
      return intersectedWellnessFactors.length === Array.from(systemWellnessFactorsSet).length;
    }

    return false;
  }
}
