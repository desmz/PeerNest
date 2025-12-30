import { Injectable } from '@nestjs/common';
import { TFindReportedContentsQueryParams } from '@peernest/contract';
import {
  DiscussionStatus,
  FindReportedContentsSortOption,
  FindReportedContentsTypeOption,
  generateUserDiscussionReportId,
  HttpErrorCode,
  UserCommentReportStatus,
  UserDiscussionReportStatus,
} from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserDiscussionReport,
  TKyselyTransaction,
  TUpdatableUserDiscussionReport,
} from '@peernest/db';
import { jsonArrayFrom, jsonBuildObject } from 'kysely/helpers/postgres';

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

  // special case
  async findReportedContents(options?: TFindReportedContentsQueryParams, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { limit = 500, offset = 0, sort, type } = options || {};

      let query = db
        .with('base_report', (eb) =>
          eb
            .selectFrom('userDiscussionReport')
            .select((eb) => [
              'userDiscussionReportId as reportId',
              'userDiscussionReportReporterId as reporterId',
              'userDiscussionReportDiscussionId as targetId',
              eb.val<string>(FindReportedContentsTypeOption.Discussion).as('type'),
              'userDiscussionReportStatus as reportStatus',
              'userDiscussionReportReportedTime as reportedTime',
            ])
            .where('userDiscussionReportStatus', '=', UserDiscussionReportStatus.Reported)
            .unionAll(
              eb
                .selectFrom('userCommentReport')
                .select((eb) => [
                  'userCommentReportId as reportId',
                  'userCommentReportReporterId as reporterId',
                  'userCommentReportCommentId as targetId',
                  eb.val<string>(FindReportedContentsTypeOption.Comment).as('type'),
                  'userCommentReportStatus as reportStatus',
                  'userCommentReportReportedTime as reportedTime',
                ])
                .where(
                  'userCommentReport.userCommentReportStatus',
                  '=',
                  UserCommentReportStatus.Reported
                )
            )
        )
        .selectFrom('base_report')
        .innerJoin('user as reporter', 'reporter.userId', 'base_report.reporterId')
        .leftJoin('discussion', (join) =>
          join
            .on('base_report.type', '=', FindReportedContentsTypeOption.Discussion)
            .onRef('discussion.discussionId', '=', 'base_report.targetId')
            .on('discussion.discussionStatus', '=', DiscussionStatus.Active)
        )
        .leftJoin(
          'user as discussion_author',
          'discussion_author.userId',
          'discussion.discussionAuthorId'
        )
        .leftJoin(
          'role as discussion_author_role',
          'discussion_author_role.roleId',
          'discussion_author.userRoleId'
        )
        .leftJoin(
          'discussionAttachment',
          'discussionAttachment.discussionAttachmentDiscussionId',
          'discussion.discussionId'
        )
        .leftJoin('attachment', 'attachment.attachmentId', 'discussionAttachmentAttachmentId')
        .leftJoin('comment', (join) =>
          join
            .on('base_report.type', '=', FindReportedContentsTypeOption.Comment)
            .onRef('comment.commentId', '=', 'base_report.targetId')
            .on('comment.commentDeletedTime', 'is', null)
        )
        .leftJoin('user as comment_author', 'comment_author.userId', 'comment.commentAuthorId')
        .leftJoin(
          'role as comment_author_role',
          'comment_author_role.roleId',
          'comment_author.userRoleId'
        )
        .leftJoin(
          'discussion as comment_discussion',
          'comment_discussion.discussionId',
          'comment.commentDiscussionId'
        )
        .select((eb) => [
          'base_report.reportId as reportId',
          'base_report.type as type',
          'base_report.reportStatus as reportStatus',
          'base_report.reportedTime as reportedTime',
          jsonBuildObject({
            userId: eb.ref('reporter.userId'),
            userDisplayName: eb.ref('reporter.userDisplayName'),
          }).as('reporter'),

          // discussion
          'discussion.discussionId as discussionId',
          'discussion.discussionTitle as discussionTitle',
          'discussion.discussionContent as discussionContent',
          'discussion.discussionStatus as discussionStatus',
          'discussion.discussionCreatedTime as discussionCreatedTime',
          'discussion.discussionUpdatedTime as discussionUpdatedTime',
          'attachment.attachmentPath as attachmentPath',
          'attachment.attachmentMimetype as attachmentMimetype',
          jsonBuildObject({
            userId: eb.ref('discussion_author.userId'),
            userDisplayName: eb.ref('discussion_author.userDisplayName'),
            userAvatarUrl: eb.ref('discussion_author.userAvatarUrl'),
            roleName: eb.ref('discussion_author_role.roleName'),
          }).as('discussionAuthor'),
          jsonArrayFrom(
            eb
              .selectFrom('discussionInterest')
              .innerJoin(
                'interest',
                'interest.interestId',
                'discussionInterest.discussionInterestInterestId'
              )
              .whereRef(
                'discussionInterest.discussionInterestDiscussionId',
                '=',
                'discussion.discussionId'
              )
              .select([
                'interest.interestId',
                'interest.interestName',
                'discussionInterest.discussionInterestPosition as interestPosition',
              ])
              .orderBy('discussionInterest.discussionInterestPosition', 'asc')
          ).as('discussionInterests'),
          jsonArrayFrom(
            eb
              .selectFrom('discussionPersonalGoal')
              .innerJoin(
                'personalGoal',
                'personalGoal.personalGoalId',
                'discussionPersonalGoal.discussionPersonalGoalPersonalGoalId'
              )
              .whereRef(
                'discussionPersonalGoal.discussionPersonalGoalDiscussionId',
                '=',
                'discussion.discussionId'
              )
              .select([
                'personalGoal.personalGoalId',
                'personalGoal.personalGoalTitle',
                'personalGoal.personalGoalName',
                'personalGoal.personalGoalDescription',
                'discussionPersonalGoal.discussionPersonalGoalPosition as personalGoalPosition',
              ])
              .orderBy('discussionPersonalGoal.discussionPersonalGoalPosition', 'asc')
          ).as('discussionGoals'),

          // content
          'comment.commentId as commentId',
          'comment.commentDiscussionId as commentDiscussionId',
          'comment.commentParentCommentId as commentParentCommentId',
          'comment.commentContent as commentContent',
          'comment.commentCreatedTime as commentCreatedTime',
          'comment.commentUpdatedTime as commentUpdatedTime',
          jsonBuildObject({
            userId: eb.ref('comment_author.userId'),
            userDisplayName: eb.ref('comment_author.userDisplayName'),
            userAvatarUrl: eb.ref('comment_author.userAvatarUrl'),
            roleName: eb.ref('comment_author_role.roleName'),
          }).as('commentAuthor'),
          jsonBuildObject({
            discussionId: eb.ref('comment_discussion.discussionId'),
            discussionTitle: eb.ref('comment_discussion.discussionTitle'),
          }).as('commentDiscussion'),
        ]);

      if (type) {
        query = query.where('base_report.type', '=', type);
      }

      switch (sort) {
        case FindReportedContentsSortOption.Newest:
          query = query.orderBy('base_report.reportedTime', 'desc');
          break;
        default:
          query = query.orderBy('base_report.reportedTime', 'asc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const reportedContents = query.execute();

      return reportedContents;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserDiscussionReportRepository.repoName}] | Fail to find reported contents`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
