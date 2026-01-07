import { Injectable } from '@nestjs/common';

import { TAchievementCriteria, TAchievementCriteriaType } from '../types';

@Injectable()
export default abstract class AchievementHandler<TCriteriaType extends TAchievementCriteriaType> {
  abstract readonly criteriaType: TCriteriaType;

  /**
   * @param criteriaType the supported criteria type
   */
  supports(criteriaType: TAchievementCriteriaType): criteriaType is TCriteriaType {
    return criteriaType === this.criteriaType;
  }

  /**
   * @param userId the user id
   * @param criteria the criteria object for the evaluation
   */
  abstract evaluate(
    userId: string,
    criteria: TAchievementCriteria<TCriteriaType>
  ): Promise<boolean>;
}
