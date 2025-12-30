import { Injectable } from '@nestjs/common';
import {
  generateUserDiscussionReportId,
  HttpErrorCode,
  UserDiscussionReportStatus,
} from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserDiscussionReport,
  TKyselyTransaction,
  TUpdatableUserDiscussionReport,
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
        userDiscussionReportId: userDiscussionReportObj.userDiscussionReportId
          ? userDiscussionReportObj.userDiscussionReportId
          : generateUserDiscussionReportId(),
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

  async updateUserDiscussionReportById(
    userDiscussionReportPayload: TUpdatableUserDiscussionReport,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userDiscussionReport = await db
        .updateTable('userDiscussionReport')
        .set(userDiscussionReportPayload)
        .where('userDiscussionReportId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return userDiscussionReport!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionReportRepository.repoName}] | Fail to update user-discussion-report by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userDiscussionReportPayload, id }
      );
    }
  }

  async findUserDiscussionReportById(
    id: string,
    options?: { statuses?: UserDiscussionReportStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { statuses } = options || {};

      let query = db
        .selectFrom('userDiscussionReport')
        .selectAll()
        .where('userDiscussionReportId', '=', id);

      if (statuses && statuses.length > 0) {
        query = query.where('userDiscussionReportStatus', 'in', statuses);
      }

      const userDiscussionReport = await query.executeTakeFirst();

      return userDiscussionReport;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionReportRepository.repoName}] | Fail to find user-discussion-report by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }
}
