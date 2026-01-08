import { Injectable } from '@nestjs/common';

import { TAchievementCriteria } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class CreateAccountHandler extends AchievementHandler<'createAccount'> {
  readonly criteriaType = 'createAccount';

  async evaluate(criteria: TAchievementCriteria<'createAccount'>): Promise<boolean> {
    return criteria.event === 'accountCreated';
  }
}
