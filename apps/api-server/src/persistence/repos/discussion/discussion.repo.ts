import { Injectable } from '@nestjs/common';
import {
  TFindArchivedDiscussionsQueryParams,
  TFindDiscussionsQueryParams,
} from '@peernest/contract';
import {
  DiscussionStatus,
  FindArchivedDiscussionsSortOption,
  FindDiscussionsSortOption,
  generateDiscussionId,
  HttpErrorCode,
  UserDiscussionReportStatus,
} from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussion,
  TKyselyTransaction,
  TUpdatableDiscussion,
} from '@peernest/db';
import { DB } from '@peernest/db/types/db';
import { Expression, expressionBuilder, sql, SqlBool } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';
import tsquery from 'pg-tsquery';

import { CustomHttpException } from '@/custom.exception';

//todo: refactor
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

  async updateDiscussionById(
    discussionPayload: TUpdatableDiscussion,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = discussionPayload.discussionUpdatedTime
        ? discussionPayload.discussionUpdatedTime
        : new Date();

      const discussion = await db
        .updateTable('discussion')
        .set({
          ...discussionPayload,
          discussionUpdatedTime: now,
        })
        .where('discussionId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return discussion!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to update discussion by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionPayload }
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

  async findDiscussionsByUserId(
    userId: string,
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
        .where('discussion.discussionAuthorId', '=', userId);

      if (!includedDeleted) {
        query = query.where('discussion.discussionDeletedTime', 'is', null);
      }

      if (statuses && statuses.length > 0) {
        query = query.where('discussion.discussionStatus', 'in', statuses);
      }

      const discussions = await query.execute();

      return discussions;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find discussions by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }

  async findDiscussionsByIds(
    ids: string[],
    options?: { includedDeleted?: boolean; statuses?: DiscussionStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted, statuses } = options || {};

      if (ids.length === 0) {
        return [];
      }

      let query = db
        .selectFrom('discussion')
        .leftJoin(
          'discussionAttachment',
          'discussionAttachment.discussionAttachmentDiscussionId',
          'discussion.discussionId'
        )
        .selectAll('discussion')
        .select('discussionAttachment.discussionAttachmentAttachmentId as attachmentId')
        .where('discussion.discussionId', 'in', ids);

      if (!includedDeleted) {
        query = query.where('discussion.discussionDeletedTime', 'is', null);
      }

      if (statuses && statuses.length > 0) {
        query = query.where('discussion.discussionStatus', 'in', statuses);
      }

      const discussions = await query.execute();

      return discussions;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find discussions by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
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
          'base_discussion.discussionUpdatedTime',
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
        'discussion.discussionUpdatedTime',
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

  async findUserDiscussionsByLikeCount(
    userId: string,
    likeCount: number,
    options?: { minOrMax?: 'min' | 'max' },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { minOrMax = 'min' } = options || {};

      let query = db
        .selectFrom('discussion')
        .innerJoin(
          'userDiscussionLike',
          'userDiscussionLike.userDiscussionLikeDiscussionId',
          'discussion.discussionId'
        )
        .where('discussion.discussionAuthorId', '=', userId)
        .where('discussion.discussionStatus', 'in', [DiscussionStatus.Active])
        .select((eb) => [
          'discussion.discussionId',
          eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').as('discussionLikeCount'),
        ])
        .groupBy('discussion.discussionId');

      query = query.having((eb) => {
        const commentLikeCount = eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId');

        if (minOrMax === 'max') {
          return eb(commentLikeCount, '<=', likeCount);
        } else {
          return eb(commentLikeCount, '>=', likeCount);
        }
      });

      query = query.orderBy('discussion.discussionCreatedTime', 'asc');

      const discussions = await query.execute();

      return discussions;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find user discussions by like count`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, likeCount, options }
      );
    }
  }

  // special case
  async findDiscussions(
    userId: string,
    options?: TFindDiscussionsQueryParams,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const {
        q = '',
        interestIds,
        goalIds,
        authorId,
        likedBy,
        sort,
        limit = 500,
        offset = 0,
        statuses = [DiscussionStatus.Active],
      } = options || {};

      const discussionQuery = q ? tsquery()(q.trim() + '*') : null;

      let query = db
        .with('base_discussion', (eb) =>
          eb
            .selectFrom('discussion')
            .leftJoin(
              'discussionInterest',
              'discussionInterest.discussionInterestDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin(
              'discussionPersonalGoal',
              'discussionPersonalGoal.discussionPersonalGoalDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin(
              'userDiscussionLike',
              'userDiscussionLike.userDiscussionLikeDiscussionId',
              'discussion.discussionId'
            )
            .where('discussion.discussionDeletedTime', 'is', null)
            .where((eb) => {
              const ors: Expression<SqlBool>[] = [];

              if (interestIds && interestIds.length > 0) {
                ors.push(eb('discussionInterest.discussionInterestInterestId', 'in', interestIds));
              }

              if (goalIds && goalIds.length > 0) {
                ors.push(
                  eb('discussionPersonalGoal.discussionPersonalGoalPersonalGoalId', 'in', goalIds)
                );
              }

              return ors.length > 0 ? eb.or(ors) : sql`true`;
            })
            .$if(Boolean(statuses && statuses.length > 0), (eb) =>
              eb.where('discussion.discussionStatus', 'in', statuses)
            )
            .$if(Boolean(authorId), (eb) =>
              eb.where('discussion.discussionAuthorId', '=', authorId!)
            )
            .$if(Boolean(likedBy), (eb) =>
              eb.where('userDiscussionLike.userDiscussionLikeUserId', '=', likedBy!)
            )
            .$if(Boolean(discussionQuery), (eb) =>
              eb.where(
                'discussion.discussionSearchTsv',
                '@@',
                sql<string>`to_tsquery('english', f_unaccent(${discussionQuery}))`
              )
            )
            .select((eb) => [
              'discussion.discussionId',
              eb.fn
                .coalesce(
                  sql<number>`
                      ts_rank(
                        discussion_search_tsv,
                        to_tsquery('english', f_unaccent(${discussionQuery}))
                      )
                    `,
                  eb.val(0)
                )
                .as('rank'),
              sql<number>`
                EXTRACT(
                  EPOCH FROM (now() - discussion.discussion_created_time)
                  ) / 3600`.as('hoursSinceCreated'),
            ])
            .distinct()
        )
        .with('discussion_stat', (eb) =>
          eb
            .selectFrom('discussion')
            .leftJoin(
              'userDiscussionLike',
              'userDiscussionLike.userDiscussionLikeDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin(
              'userDiscussionReport',
              'userDiscussionReport.userDiscussionReportDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin('comment', 'comment.commentDiscussionId', 'discussion.discussionId')
            .where('discussion.discussionDeletedTime', 'is', null)
            .groupBy('discussion.discussionId')
            .select((eb) => [
              'discussion.discussionId',
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').distinct(),
                  eb.val(0)
                )
                .as('likeCount'),
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userDiscussionReport.userDiscussionReportId').distinct(),
                  eb.val(0)
                )
                .as('reportCount'),
              eb.fn
                .coalesce(eb.fn.count<number>('comment.commentId').distinct(), eb.val(0))
                .as('commentCount'),
              eb.fn
                .coalesce(
                  eb.fn
                    .count<number>('comment.commentId')
                    .filterWhere('comment.commentDeletedTime', 'is', null)
                    .distinct(),
                  eb.val(0)
                )
                .as('nonDeletedCommentCount'),
            ])
        )
        .with('discussion_interest_agg', (eb) =>
          eb
            .selectFrom('discussionInterest')
            .innerJoin(
              'interest',
              'interest.interestId',
              'discussionInterest.discussionInterestInterestId'
            )
            .where('discussionInterest.discussionInterestDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .groupBy('discussionInterest.discussionInterestDiscussionId')
            .select((eb) => [
              'discussionInterest.discussionInterestDiscussionId as discussionId',
              eb.fn
                .jsonAgg(
                  jsonBuildObject({
                    interestId: eb.ref('interest.interestId'),
                    interestName: eb.ref('interest.interestName'),
                    interestPosition: eb.ref('discussionInterest.discussionInterestPosition'),
                  })
                )
                .orderBy(eb.ref('discussionInterest.discussionInterestPosition'), 'asc')
                .as('interests'),
            ])
        )
        .with('discussion_goal_agg', (eb) =>
          eb
            .selectFrom('discussionPersonalGoal')
            .innerJoin(
              'personalGoal',
              'personalGoal.personalGoalId',
              'discussionPersonalGoal.discussionPersonalGoalPersonalGoalId'
            )
            .where('discussionPersonalGoal.discussionPersonalGoalDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .groupBy('discussionPersonalGoal.discussionPersonalGoalDiscussionId')
            .select((eb) => [
              'discussionPersonalGoal.discussionPersonalGoalDiscussionId as discussionId',
              eb.fn
                .jsonAgg(
                  jsonBuildObject({
                    personalGoalId: eb.ref('personalGoal.personalGoalId'),
                    personalGoalTitle: eb.ref('personalGoal.personalGoalTitle'),
                    personalGoalName: eb.ref('personalGoal.personalGoalName'),
                    personalGoalDescription: eb.ref('personalGoal.personalGoalDescription'),
                    personalGoalPosition: eb.ref(
                      'discussionPersonalGoal.discussionPersonalGoalPosition'
                    ),
                  })
                )
                .orderBy(eb.ref('discussionPersonalGoal.discussionPersonalGoalPosition'), 'asc')
                .as('goals'),
            ])
        )
        .with('discussion_attachment', (eb) =>
          eb
            .selectFrom('discussionAttachment')
            .innerJoin(
              'attachment',
              'attachment.attachmentId',
              'discussionAttachment.discussionAttachmentAttachmentId'
            )
            .where('discussionAttachment.discussionAttachmentDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .select([
              'discussionAttachment.discussionAttachmentDiscussionId as discussionId',
              'attachment.attachmentPath',
              'attachment.attachmentMimetype',
            ])
        )
        .selectFrom('base_discussion')
        .innerJoin('discussion', 'discussion.discussionId', 'base_discussion.discussionId')
        .innerJoin('user', 'user.userId', 'discussion.discussionAuthorId')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .leftJoin('discussion_stat', 'discussion_stat.discussionId', 'discussion.discussionId')
        .leftJoin(
          'discussion_interest_agg',
          'discussion_interest_agg.discussionId',
          'base_discussion.discussionId'
        )
        .leftJoin(
          'discussion_goal_agg',
          'discussion_goal_agg.discussionId',
          'base_discussion.discussionId'
        )
        .leftJoin(
          'discussion_attachment',
          'discussion_attachment.discussionId',
          'base_discussion.discussionId'
        )
        .select((eb) => [
          'discussion.discussionId',
          'discussion.discussionTitle',
          'discussion.discussionContent',
          'discussion.discussionStatus',
          'discussion.discussionCreatedTime',
          'discussion.discussionUpdatedTime',
          'base_discussion.rank',
          jsonBuildObject({
            userId: eb.ref('user.userId'),
            userDisplayName: eb.ref('user.userDisplayName'),
            userAvatarUrl: eb.ref('user.userAvatarUrl'),
            roleName: eb.ref('role.roleName'),
          }).as('author'),
          'discussion_interest_agg.interests',
          'discussion_goal_agg.goals',
          'discussion_stat.likeCount',
          'discussion_stat.commentCount',
          'base_discussion.hoursSinceCreated',
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
            .as('isLiked'),
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
                .select('userDiscussionReport.userDiscussionReportId')
            )
            .as('isReported'),
          'discussion_attachment.attachmentPath',
          'discussion_attachment.attachmentMimetype',
          eb
            .fn<string>('least', [
              sql<number>`
                discussion_stat.like_count * 3
                + discussion_stat.non_deleted_comment_count * 2 
                - discussion_stat.report_count * 5 
                + (100.0 / (1 + base_discussion.hours_since_created))`,
              eb.val(20),
            ])
            .as('score'),
        ]);

      if (discussionQuery) {
        query = query.orderBy('base_discussion.rank', 'desc');
      } else if (sort === FindDiscussionsSortOption.Liked) {
        query = query.orderBy('discussion_stat.likeCount', 'desc');
      } else if (sort === FindDiscussionsSortOption.Oldest) {
        query = query.orderBy('discussion.discussionCreatedTime', 'asc');
      } else if (sort === FindDiscussionsSortOption.Trending) {
        query = query.orderBy('score', 'desc');
      } else {
        query = query.orderBy('discussion.discussionCreatedTime', 'desc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const discussionAggs = await query.execute();

      return discussionAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find discussions`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findArchivedDiscussions(
    options?: TFindArchivedDiscussionsQueryParams,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { sort, limit = 500, offset = 0 } = options || {};

      let query = db
        .with('base_discussion', (eb) =>
          eb
            .selectFrom('discussion')
            .where('discussionStatus', '=', DiscussionStatus.Archived)
            .select(['discussion.discussionId'])
            .distinct()
        )
        .with('discussion_stat', (eb) =>
          eb
            .selectFrom('discussion')
            .leftJoin(
              'userDiscussionLike',
              'userDiscussionLike.userDiscussionLikeDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin('comment', 'comment.commentDiscussionId', 'discussion.discussionId')
            .where('discussion.discussionDeletedTime', 'is', null)
            .groupBy('discussion.discussionId')
            .select((eb) => [
              'discussion.discussionId',
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').distinct(),
                  eb.val(0)
                )
                .as('likeCount'),
              eb.fn
                .coalesce(eb.fn.count<number>('comment.commentId').distinct(), eb.val(0))
                .as('commentCount'),
            ])
        )
        .with('discussion_interest_agg', (eb) =>
          eb
            .selectFrom('discussionInterest')
            .innerJoin(
              'interest',
              'interest.interestId',
              'discussionInterest.discussionInterestInterestId'
            )
            .where('discussionInterest.discussionInterestDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .groupBy('discussionInterest.discussionInterestDiscussionId')
            .select((eb) => [
              'discussionInterest.discussionInterestDiscussionId as discussionId',
              eb.fn
                .jsonAgg(
                  jsonBuildObject({
                    interestId: eb.ref('interest.interestId'),
                    interestName: eb.ref('interest.interestName'),
                    interestPosition: eb.ref('discussionInterest.discussionInterestPosition'),
                  })
                )
                .orderBy(eb.ref('discussionInterest.discussionInterestPosition'), 'asc')
                .as('interests'),
            ])
        )
        .with('discussion_goal_agg', (eb) =>
          eb
            .selectFrom('discussionPersonalGoal')
            .innerJoin(
              'personalGoal',
              'personalGoal.personalGoalId',
              'discussionPersonalGoal.discussionPersonalGoalPersonalGoalId'
            )
            .where('discussionPersonalGoal.discussionPersonalGoalDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .groupBy('discussionPersonalGoal.discussionPersonalGoalDiscussionId')
            .select((eb) => [
              'discussionPersonalGoal.discussionPersonalGoalDiscussionId as discussionId',
              eb.fn
                .jsonAgg(
                  jsonBuildObject({
                    personalGoalId: eb.ref('personalGoal.personalGoalId'),
                    personalGoalTitle: eb.ref('personalGoal.personalGoalTitle'),
                    personalGoalName: eb.ref('personalGoal.personalGoalName'),
                    personalGoalDescription: eb.ref('personalGoal.personalGoalDescription'),
                    personalGoalPosition: eb.ref(
                      'discussionPersonalGoal.discussionPersonalGoalPosition'
                    ),
                  })
                )
                .orderBy(eb.ref('discussionPersonalGoal.discussionPersonalGoalPosition'), 'asc')
                .as('goals'),
            ])
        )
        .with('discussion_attachment', (eb) =>
          eb
            .selectFrom('discussionAttachment')
            .innerJoin(
              'attachment',
              'attachment.attachmentId',
              'discussionAttachment.discussionAttachmentAttachmentId'
            )
            .where('discussionAttachment.discussionAttachmentDiscussionId', 'in', (eb) =>
              eb.selectFrom('base_discussion').select('base_discussion.discussionId')
            )
            .select([
              'discussionAttachment.discussionAttachmentDiscussionId as discussionId',
              'attachment.attachmentPath',
              'attachment.attachmentMimetype',
            ])
        )
        .selectFrom('base_discussion')
        .innerJoin('discussion', 'discussion.discussionId', 'base_discussion.discussionId')
        .innerJoin('user', 'user.userId', 'discussion.discussionAuthorId')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .leftJoin('discussion_stat', 'discussion_stat.discussionId', 'discussion.discussionId')
        .leftJoin(
          'discussion_interest_agg',
          'discussion_interest_agg.discussionId',
          'base_discussion.discussionId'
        )
        .leftJoin(
          'discussion_goal_agg',
          'discussion_goal_agg.discussionId',
          'base_discussion.discussionId'
        )
        .leftJoin(
          'discussion_attachment',
          'discussion_attachment.discussionId',
          'base_discussion.discussionId'
        )
        .select((eb) => [
          'discussion.discussionId',
          'discussion.discussionTitle',
          'discussion.discussionContent',
          'discussion.discussionStatus',
          'discussion.discussionCreatedTime',
          'discussion.discussionUpdatedTime',
          'discussion.discussionArchivedBy',
          'discussion.discussionArchivedTime',
          jsonBuildObject({
            userId: eb.ref('user.userId'),
            userDisplayName: eb.ref('user.userDisplayName'),
            userAvatarUrl: eb.ref('user.userAvatarUrl'),
            roleName: eb.ref('role.roleName'),
          }).as('author'),
          'discussion_interest_agg.interests',
          'discussion_goal_agg.goals',
          'discussion_stat.likeCount',
          'discussion_stat.commentCount',
          'discussion_attachment.attachmentPath',
          'discussion_attachment.attachmentMimetype',
        ]);

      switch (sort) {
        case FindArchivedDiscussionsSortOption.Oldest:
          query = query.orderBy('discussion.discussionCreatedTime', 'asc');
          break;
        default:
          query = query.orderBy('discussion.discussionCreatedTime', 'desc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const discussionAggs = await query.execute();

      return discussionAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find archived discussions`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findTotalLikesAcrossUserDiscussions(userId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const totalLikeCountObj = await db
        .selectFrom('discussion')
        .innerJoin(
          'userDiscussionLike',
          'userDiscussionLike.userDiscussionLikeDiscussionId',
          'discussion.discussionId'
        )
        .where('discussion.discussionAuthorId', '=', userId)
        .where('discussion.discussionStatus', 'in', [DiscussionStatus.Active])
        .select((eb) => [
          eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').as('totalLikeCount'),
        ])
        .executeTakeFirst();

      return totalLikeCountObj;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionRepository.repoName}] | Fail to find total likes across user discussions`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId }
      );
    }
  }
}
