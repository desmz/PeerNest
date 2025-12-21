import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussionPersonalGoal,
  TKyselyTransaction,
} from '@peernest/db';
import { Expression, SqlBool } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionPersonalGoalRepository {
  private static repoName = 'DISCUSSION_PERSONAL_GOAL_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createDiscussionPersonalGoals(
    discussionPersonalGoalObjs: TInsertableDiscussionPersonalGoal[],
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      let query = db.insertInto('discussionPersonalGoal').values(discussionPersonalGoalObjs);

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc
            .columns(['discussionPersonalGoalDiscussionId', 'discussionPersonalGoalPersonalGoalId'])
            .doNothing()
        );
      }

      const discussionPersonalGoal = await query.returningAll().executeTakeFirst();

      return discussionPersonalGoal!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionPersonalGoalRepository.repoName}] | Fail to create discussion- personal-goal`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionPersonalGoalObjs }
      );
    }
  }

  async deleteDiscussionPersonalGoals(
    discussionPersonalGoalKeys: {
      discussionPersonalGoalDiscussionId: string;
      discussionPersonalGoalPersonalGoalIds: string[];
    },
    options?: { isExcludePersonalGoalIds?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const { discussionPersonalGoalDiscussionId, discussionPersonalGoalPersonalGoalIds } =
        discussionPersonalGoalKeys;
      const { isExcludePersonalGoalIds } = options || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .deleteFrom('discussionPersonalGoal')
        .where(({ and, eb }) => {
          const ands: Expression<SqlBool>[] = [];

          ands.push(
            eb('discussionPersonalGoalDiscussionId', '=', discussionPersonalGoalDiscussionId)
          );

          if (isExcludePersonalGoalIds) {
            ands.push(
              eb(
                'discussionPersonalGoalPersonalGoalId',
                'not in',
                discussionPersonalGoalPersonalGoalIds
              )
            );
          } else {
            ands.push(
              eb(
                'discussionPersonalGoalPersonalGoalId',
                'in',
                discussionPersonalGoalPersonalGoalIds
              )
            );
          }

          return and(ands);
        })
        .execute();
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionPersonalGoalRepository.repoName}] | Fail to delete discussion-personal-goal `,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPositionByDiscussionId(discussionId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const discussionPersonalGoal = await db
        .selectFrom('discussionPersonalGoal')
        .select((eb) =>
          eb.fn.max('discussionPersonalGoalPosition').as('discussionPersonalGoalMaxPosition')
        )
        .where('discussionPersonalGoalDiscussionId', '=', discussionId)
        .executeTakeFirst();

      let maxPos = -1;

      if (discussionPersonalGoal && discussionPersonalGoal.discussionPersonalGoalMaxPosition) {
        maxPos = parseInt(discussionPersonalGoal.discussionPersonalGoalMaxPosition);
      }

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionPersonalGoalRepository.repoName}] | Fail to find maximum position of discussion-personal-goal by discussion id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
