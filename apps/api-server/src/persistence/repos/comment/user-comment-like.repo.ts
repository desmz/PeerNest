import { Injectable } from '@nestjs/common';
import { generateUserCommentLikeId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserCommentLike,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserCommentLikeRepository {
  private static repoName = 'USER_COMMENT_LIKE_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserCommentLike(
    userCommentLikeObj: TInsertableUserCommentLike,
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      const now = userCommentLikeObj.userCommentLikeCreatedTime
        ? userCommentLikeObj.userCommentLikeCreatedTime
        : new Date();

      let query = db.insertInto('userCommentLike').values({
        ...userCommentLikeObj,
        userCommentLikeId: userCommentLikeObj.userCommentLikeId
          ? userCommentLikeObj.userCommentLikeId
          : generateUserCommentLikeId(),
        userCommentLikeCreatedTime: now,
      });

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc.columns(['userCommentLikeUserId', 'userCommentLikeCommentId']).doNothing()
        );
      }

      const userCommentLike = await query.returningAll().executeTakeFirst();

      return userCommentLike!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserCommentLikeRepository.repoName}] | Fail to create user-comment-like`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userCommentLikeObj, options }
      );
    }
  }
}
