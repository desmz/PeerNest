import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserDiscussionReport,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserDiscussionReportRepository {
  private static repoName = 'USER_DISCUSSION_REPORT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserDiscussionReport(
    userDiscussionReportObj: TInsertableUserDiscussionReport,
    options?: { onConflictDoNothing?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { onConflictDoNothing } = options || {};

      const now = userDiscussionReportObj.userDiscussionReportReportedTime
        ? userDiscussionReportObj.userDiscussionReportReportedTime
        : new Date();

      let query = db.insertInto('userDiscussionReport').values({
        ...userDiscussionReportObj,
        userDiscussionReportReportedTime: now,
      });

      if (onConflictDoNothing) {
        query = query.onConflict((oc) =>
          oc
            .columns(['userDiscussionReportReporterId', 'userDiscussionReportDiscussionId'])
            .doNothing()
        );
      }

      const userDiscussionReport = await query.returningAll().executeTakeFirst();

      return userDiscussionReport!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionReportRepository.repoName}] | Fail to create user-discussion-report`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userDiscussionReportObj, options }
      );
    }
  }
}
