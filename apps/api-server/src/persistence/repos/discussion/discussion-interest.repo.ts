import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussionInterest,
  TKyselyTransaction,
} from '@peernest/db';
import { Expression, SqlBool } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionInterestRepository {
  private static repoName = 'DISCUSSION_INTEREST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createDiscussionInterests(
    discussionInterestObjs: TInsertableDiscussionInterest[],
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      let query = db.insertInto('discussionInterest').values(discussionInterestObjs);

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc.columns(['discussionInterestDiscussionId', 'discussionInterestInterestId']).doNothing()
        );
      }

      const discussionInterest = query.returningAll().executeTakeFirst();

      return discussionInterest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionInterestRepository.repoName}] | Fail to create discussion-interest`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionInterestObjs }
      );
    }
  }

  async deleteDiscussionInterests(
    discussionInterestKeys: {
      discussionInterestDiscussionId: string;
      discussionInterestInterestIds: string[];
    },
    options?: { isExcludeInterestIds?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const { discussionInterestDiscussionId, discussionInterestInterestIds } =
        discussionInterestKeys;
      const { isExcludeInterestIds } = options || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .deleteFrom('discussionInterest')
        .where(({ and, eb }) => {
          const ands: Expression<SqlBool>[] = [];

          ands.push(eb('discussionInterestDiscussionId', '=', discussionInterestDiscussionId));

          if (isExcludeInterestIds) {
            ands.push(eb('discussionInterestInterestId', 'not in', discussionInterestInterestIds));
          } else {
            ands.push(eb('discussionInterestInterestId', 'in', discussionInterestInterestIds));
          }

          return and(ands);
        })
        .execute();
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionInterestRepository.repoName}] | Fail to delete discussion-interest `,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPositionByDiscussionId(discussionId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const discussionInterest = await db
        .selectFrom('discussionInterest')
        .select((eb) => eb.fn.max('discussionInterestPosition').as('discussionInterestMaxPosition'))
        .where('discussionInterestDiscussionId', '=', discussionId)
        .executeTakeFirst();

      let maxPos = -1;

      if (discussionInterest && discussionInterest.discussionInterestMaxPosition) {
        maxPos = parseInt(discussionInterest.discussionInterestMaxPosition);
      }

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionInterestRepository.repoName}] | Fail to find maximum position of discussion-interest by discussion id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
