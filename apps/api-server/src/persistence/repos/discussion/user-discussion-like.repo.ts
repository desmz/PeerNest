import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserDiscussionLike,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserDiscussionLikeRepository {
  private static repoName = 'USER_DISCUSSION_LIKE_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserDiscussionLike(
    userDiscussionLikeObj: TInsertableUserDiscussionLike,
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      const now = userDiscussionLikeObj.userDiscussionLikeCreatedTime
        ? userDiscussionLikeObj.userDiscussionLikeCreatedTime
        : new Date();

      let query = db.insertInto('userDiscussionLike').values({
        ...userDiscussionLikeObj,
        userDiscussionLikeCreatedTime: now,
      });

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc.columns(['userDiscussionLikeUserId', 'userDiscussionLikeDiscussionId']).doNothing()
        );
      }

      const userDiscussionLike = await query.returningAll().executeTakeFirst();

      return userDiscussionLike!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionLikeRepository.repoName}] | Fail to create user-discussion-like`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userDiscussionLikeObj, options }
      );
    }
  }

  async deleteUserDiscussionLikeByIds(
    ids: { userId: string; discussionId: string },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { userId, discussionId } = ids;

      await db
        .deleteFrom('userDiscussionLike')
        .where('userDiscussionLikeUserId', '=', userId)
        .where('userDiscussionLikeDiscussionId', '=', discussionId)
        .executeTakeFirst();
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionLikeRepository.repoName}] | Fail to create user-discussion-like`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }
}
