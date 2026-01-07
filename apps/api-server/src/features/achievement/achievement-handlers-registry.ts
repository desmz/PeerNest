import { Injectable } from '@nestjs/common';

import { InjectAchievementHandlers } from './achievement.token';
import AchievementHandler from './handlers/achievement-handler';
import { TAchievementCriteriaType } from './types';

@Injectable()
export class AchievementHandlersRegistry {
  constructor(
    @InjectAchievementHandlers()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private readonly achievementHandlers: AchievementHandler<any>[]
  ) {}

  getAchievementHandlerByCriteriaType(criteriaType: TAchievementCriteriaType) {
    return this.achievementHandlers.find((achievementHandler) =>
      achievementHandler.supports(criteriaType)
    );
  }
}
