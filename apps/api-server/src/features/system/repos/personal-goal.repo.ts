import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectablePersonalGoal } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class PersonalGoalRepository {
  private static repoName = 'PERSONAL_GOAL_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findPersonalGoals(
    options?: {
      orderBy?: keyof TSelectablePersonalGoal | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('personalGoal').selectAll();

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const personalGoals = await query.execute();

      return personalGoals;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to find personal goals`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
