import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussionPersonalGoal,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionPersonalGoalRepository {
  private static repoName = 'DISCUSSION_PERSONAL_GOAL_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createDiscussionPersonalGoals(
    discussionPersonalGoalObjs: TInsertableDiscussionPersonalGoal[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const discussionPersonalGoal = await db
        .insertInto('discussionPersonalGoal')
        .values(discussionPersonalGoalObjs)
        .returningAll()
        .executeTakeFirst();

      return discussionPersonalGoal!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionPersonalGoalRepository.repoName}] | Fail to create discussion personal goal`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionPersonalGoalObjs }
      );
    }
  }
}
