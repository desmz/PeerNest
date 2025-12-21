import { Injectable } from '@nestjs/common';
import {
  DiscussionStatus,
  generateDiscussionId,
  HttpErrorCode,
  UserDiscussionReportStatus,
} from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableDiscussion, TKyselyTransaction } from '@peernest/db';
import { DB } from '@peernest/db/types/db';
import { expressionBuilder } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionRepository {
  private static repoName = 'DISCUSSION_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createDiscussion(discussionObj: TInsertableDiscussion, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = discussionObj.discussionCreatedTime
        ? discussionObj.discussionCreatedTime
        : new Date();

      const discussion = await db
        .insertInto('discussion')
        .values({
          ...discussionObj,
          discussionId: discussionObj.discussionId
            ? discussionObj.discussionId
            : generateDiscussionId(),
          discussionCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return discussion!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to create discussion`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionObj }
      );
    }
  }

  async findDiscussionById(
    id: string,
    options?: { includedDeleted?: boolean; statuses?: DiscussionStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted, statuses } = options || {};

      let query = db
        .selectFrom('discussion')
        .leftJoin(
          'discussionAttachment',
          'discussionAttachment.discussionAttachmentDiscussionId',
          'discussion.discussionId'
        )
        .selectAll('discussion')
        .select('discussionAttachment.discussionAttachmentAttachmentId as attachmentId')
        .where('discussion.discussionId', '=', id);

      if (!includedDeleted) {
        query = query.where('discussion.discussionDeletedTime', 'is', null);
      }

      if (statuses && statuses.length > 0) {
        query = query.where('discussion.discussionStatus', 'in', statuses);
      }

      const discussion = await query.executeTakeFirst();

      return discussion;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find discussion by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }

  async findDiscussionAggByIds(
    ids: {
      discussionId: string;
      userId: string;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { discussionId, userId } = ids;

      const discussionAgg = await db
        .with('base_discussion', () => this.withBaseDiscussion(discussionId))
        .with('interests_agg', () => this.withInterestsAgg(discussionId))
        .with('goals_agg', () => this.withPersonalGoalAgg(discussionId))
        .with('stats', () => this.withStat(discussionId, userId))
        .selectFrom('base_discussion')
        .leftJoin(
          'interests_agg',
          'interests_agg.discussionInterestDiscussionId',
          'base_discussion.discussionId'
        )
        .leftJoin(
          'goals_agg',
          'goals_agg.discussionPersonalGoalDiscussionId',
          'base_discussion.discussionId'
        )
        .leftJoin('stats', 'stats.discussionId', 'base_discussion.discussionId')
        .select((eb) => [
          'base_discussion.discussionId',
          'base_discussion.discussionTitle',
          'base_discussion.discussionContent',
          'base_discussion.discussionStatus',
          'base_discussion.discussionCreatedTime',
          jsonBuildObject({
            userId: eb.ref('base_discussion.userId'),
            userDisplayName: eb.ref('base_discussion.userDisplayName'),
            userAvatarUrl: eb.ref('base_discussion.userAvatarUrl'),
            roleName: eb.ref('base_discussion.roleName'),
          }).as('author'),
          'interests_agg.interests',
          'goals_agg.goals',
          'stats.like_count as likeCount',
          'stats.comment_count as commentCount',
          'stats.is_liked as isLiked',
          'stats.is_reported as isReported',
        ])
        .executeTakeFirst();

      return discussionAgg;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find discussion agg by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }

  private withBaseDiscussion(discussionId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('discussion')
      .innerJoin('user', 'user.userId', 'discussion.discussionAuthorId')
      .innerJoin('role', 'role.roleId', 'user.userRoleId')
      .where('discussion.discussionId', '=', discussionId)
      .select([
        'discussion.discussionId',
        'discussion.discussionTitle',
        'discussion.discussionContent',
        'discussion.discussionStatus',
        'discussion.discussionCreatedTime',
        'user.userId',
        'user.userDisplayName',
        'user.userAvatarUrl',
        'role.roleName',
      ]);
  }

  private withInterestsAgg(discussionId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('discussionInterest')
      .innerJoin(
        'interest',
        'interest.interestId',
        'discussionInterest.discussionInterestInterestId'
      )
      .where('discussionInterest.discussionInterestDiscussionId', '=', discussionId)
      .groupBy('discussionInterest.discussionInterestDiscussionId')
      .select(['discussionInterest.discussionInterestDiscussionId'])
      .select((eb) =>
        eb.fn
          .jsonAgg(
            jsonBuildObject({
              interestId: eb.ref('interest.interestId'),
              interestName: eb.ref('interest.interestName'),
              interestPosition: eb.ref('discussionInterest.discussionInterestPosition'),
            })
          )
          .orderBy(eb.ref('discussionInterest.discussionInterestPosition'), 'asc')
          .as('interests')
      );
  }

  private withPersonalGoalAgg(discussionId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('discussionPersonalGoal')
      .innerJoin(
        'personalGoal',
        'personalGoal.personalGoalId',
        'discussionPersonalGoal.discussionPersonalGoalPersonalGoalId'
      )
      .where('discussionPersonalGoal.discussionPersonalGoalDiscussionId', '=', discussionId)
      .groupBy('discussionPersonalGoal.discussionPersonalGoalDiscussionId')
      .select(['discussionPersonalGoal.discussionPersonalGoalDiscussionId'])
      .select((eb) =>
        eb.fn
          .jsonAgg(
            jsonBuildObject({
              personalGoalId: eb.ref('personalGoal.personalGoalId'),
              personalGoalTitle: eb.ref('personalGoal.personalGoalTitle'),
              personalGoalName: eb.ref('personalGoal.personalGoalName'),
              personalGoalDescription: eb.ref('personalGoal.personalGoalDescription'),
              personalGoalPosition: eb.ref('discussionPersonalGoal.discussionPersonalGoalPosition'),
            })
          )
          .orderBy(eb.ref('discussionPersonalGoal.discussionPersonalGoalPosition'), 'asc')
          .as('goals')
      );
  }

  private withStat(discussionId: string, userId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('discussion')
      .leftJoin(
        'userDiscussionLike',
        'userDiscussionLike.userDiscussionLikeDiscussionId',
        'discussion.discussionId'
      )
      .leftJoin('comment', 'comment.commentDiscussionId', 'discussion.discussionId')
      .where('discussion.discussionId', '=', discussionId)
      .groupBy('discussion.discussionId')
      .select((eb) => [
        'discussion.discussionId',
        eb.fn
          .coalesce(
            eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').distinct(),
            eb.val(0)
          )
          .as('like_count'),
        eb.fn
          .coalesce(
            eb.fn
              .count<number>('comment.commentId')
              .distinct()
              .filterWhere('comment.commentDeletedTime', 'is', null),
            eb.val(0)
          )
          .as('comment_count'),
        eb.fn
          .coalesce(
            eb
              .exists(
                eb
                  .selectFrom('userDiscussionLike')
                  .whereRef(
                    'userDiscussionLike.userDiscussionLikeDiscussionId',
                    '=',
                    'discussion.discussionId'
                  )
                  .where('userDiscussionLike.userDiscussionLikeUserId', '=', userId)
                  .select('userDiscussionLike.userDiscussionLikeId')
              )
              .$castTo<boolean>(),
            eb.val(false)
          )
          .as('is_liked'),
        eb.fn
          .coalesce(
            eb
              .exists(
                eb
                  .selectFrom('userDiscussionReport')
                  .whereRef(
                    'userDiscussionReport.userDiscussionReportDiscussionId',
                    '=',
                    'discussion.discussionId'
                  )
                  .where('userDiscussionReport.userDiscussionReportReporterId', '=', userId)
                  .where(
                    'userDiscussionReport.userDiscussionReportStatus',
                    '=',
                    UserDiscussionReportStatus.Reported
                  )
              )
              .$castTo<boolean>(),
            eb.val(false)
          )
          .as('is_reported'),
      ]);
  }
}
