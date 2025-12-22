import { Injectable } from '@nestjs/common';
import { generateUserCommentReportId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserCommentReport,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserCommentReportRepository {
  private static repoName = 'USER_COMMENT_REPORT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserCommentReport(
    userCommentReportObj: TInsertableUserCommentReport,
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      const now = userCommentReportObj.userCommentReportReportedTime
        ? userCommentReportObj.userCommentReportReportedTime
        : new Date();

      let query = db.insertInto('userCommentReport').values({
        ...userCommentReportObj,
        userCommentReportId: userCommentReportObj.userCommentReportId
          ? userCommentReportObj.userCommentReportId
          : generateUserCommentReportId(),
        userCommentReportReportedTime: now,
      });

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc.columns(['userCommentReportReporterId', 'userCommentReportCommentId']).doNothing()
        );
      }

      const userCommentReport = await query.returningAll().executeTakeFirst();

      return userCommentReport!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserCommentReportRepository.repoName}] | Fail to create user-comment-report`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userCommentReportObj, options }
      );
    }
  }
}
