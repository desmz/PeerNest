/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  TFindDiscussionCommentsQueryParams,
  TFindUserCommentsQueryParams,
} from '@peernest/contract';
import {
  DiscussionStatus,
  FindDiscussionCommentsSortOption,
  FindUserCommentsSortOption,
  FindUserCommentsType,
  generateCommentId,
  HttpErrorCode,
  UserCommentReportStatus,
  UserDiscussionReportStatus,
} from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableComment,
  TKyselyDB,
  TKyselyTransaction,
  TUpdatableComment,
} from '@peernest/db';
import { DB } from '@peernest/db/types/db';
import { Expression, expressionBuilder, sql, SqlBool } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';
import { getFullStorageUrl } from '@/features/attachment/utils';

//todo: refactor
@Injectable()
export class CommentRepository {
  private static repoName = 'COMMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createComment(commentObj: TInsertableComment, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = commentObj.commentCreatedTime ? commentObj.commentCreatedTime : new Date();

      const comment = await db
        .insertInto('comment')
        .values({
          ...commentObj,
          commentId: commentObj.commentId ? commentObj.commentId : generateCommentId(),
          commentCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return comment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to create comment`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, commentObj }
      );
    }
  }

  async updateCommentById(commentPayload: TUpdatableComment, id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = commentPayload.commentUpdatedTime
        ? commentPayload.commentUpdatedTime
        : new Date();

      const comment = await db
        .updateTable('comment')
        .set({
          ...commentPayload,
          commentUpdatedTime: now,
        })
        .where('commentId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return comment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to update comment by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, commentPayload, id }
      );
    }
  }

  async findCommentById(
    id: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted } = options || {};

      let query = db.selectFrom('comment').selectAll().where('comment.commentId', '=', id);

      if (!includedDeleted) {
        query = query.where('commentDeletedTime', 'is', null);
      }

      const comment = await query.executeTakeFirst();

      return comment;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find comment by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }

  async findCommentsByIds(
    ids: string[],
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { includedDeleted } = options || {};

      if (ids.length === 0) {
        return [];
      }

      let query = db.selectFrom('comment').selectAll().where('comment.commentId', 'in', ids);

      if (!includedDeleted) {
        query = query.where('commentDeletedTime', 'is', null);
      }

      const comments = await query.execute();

      return comments;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find comments by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
      );
    }
  }

  async findCommentAggByIds(
    ids: {
      commentId: string;
      userId: string;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { commentId, userId } = ids;

      const commentAgg = await db
        .with('base_comment', () => this.withBaseComment(commentId))
        .with('stats', () => this.withStat(commentId, userId))
        .selectFrom('base_comment')
        .leftJoin('stats', 'stats.commentId', 'base_comment.commentId')
        .select((eb) => [
          'base_comment.commentId',
          'base_comment.commentDiscussionId as discussionId',
          'base_comment.commentParentCommentId',
          'base_comment.commentContent',
          'base_comment.commentCreatedTime',
          'base_comment.commentUpdatedTime',
          jsonBuildObject({
            userId: eb.ref('base_comment.userId'),
            userDisplayName: eb.ref('base_comment.userDisplayName'),
            userAvatarUrl: eb.ref('base_comment.userAvatarUrl'),
            roleName: eb.ref('base_comment.roleName'),
          }).as('author'),
          'stats.like_count as likeCount',
          'stats.reply_count as replyCount',
          'stats.is_liked as isLiked',
          'stats.is_replied as isReplied',
          'stats.is_reported as isReported',
        ])
        .executeTakeFirst();

      return commentAgg;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find comment agg by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }

  private withBaseComment(commentId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('comment')
      .innerJoin('user', 'user.userId', 'comment.commentAuthorId')
      .innerJoin('role', 'role.roleId', 'user.userRoleId')
      .where('comment.commentId', '=', commentId)
      .select([
        'comment.commentId',
        'comment.commentDiscussionId',
        'comment.commentParentCommentId',
        'comment.commentContent',
        'comment.commentCreatedTime',
        'comment.commentUpdatedTime',
        'user.userId',
        'user.userDisplayName',
        'user.userAvatarUrl',
        'role.roleName',
      ]);
  }

  private withStat(commentId: string, userId: string) {
    const eb = expressionBuilder<DB>();

    return eb
      .selectFrom('comment')
      .leftJoin('userCommentLike', 'userCommentLike.userCommentLikeCommentId', 'comment.commentId')
      .leftJoin('comment as reply', 'reply.commentParentCommentId', 'comment.commentId')
      .where('comment.commentId', '=', commentId)
      .groupBy('comment.commentId')
      .select((eb) => [
        'comment.commentId',
        eb.fn
          .coalesce(eb.fn.count<number>('userCommentLike.userCommentLikeId').distinct(), eb.val(0))
          .as('like_count'),
        eb.fn
          .coalesce(
            eb.fn
              .count<number>('reply.commentId')
              .filterWhere('reply.commentDeletedTime', 'is', null)
              .distinct(),
            eb.val(0)
          )
          .as('reply_count'),
        eb.fn
          .coalesce(
            eb
              .exists(
                eb
                  .selectFrom('userCommentLike')
                  .whereRef('userCommentLike.userCommentLikeCommentId', '=', 'comment.commentId')
                  .where('userCommentLike.userCommentLikeUserId', '=', userId)
                  .select('userCommentLike.userCommentLikeId')
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
                  .selectFrom('comment as my_reply')
                  .whereRef('my_reply.commentParentCommentId', '=', 'comment.commentId')
                  .where('my_reply.commentAuthorId', '=', userId)
                  .where('my_reply.commentDeletedTime', 'is', null)
                  .select('my_reply.commentId')
              )
              .$castTo<boolean>(),
            eb.val(false)
          )
          .as('is_replied'),
        eb.fn
          .coalesce(
            eb
              .exists(
                eb
                  .selectFrom('userCommentReport')
                  .whereRef(
                    'userCommentReport.userCommentReportCommentId',
                    '=',
                    'comment.commentId'
                  )
                  .where('userCommentReport.userCommentReportReporterId', '=', userId)
                  .where(
                    'userCommentReport.userCommentReportStatus',
                    '=',
                    UserCommentReportStatus.Reported
                  )
              )
              .$castTo<boolean>(),
            eb.val(false)
          )
          .as('is_reported'),
      ]);
  }

  // special case
  /**
   * Fetch comments for a discussion with hierarchical structure
   * Returns top-level comments with nested replies
   */
  async findCommentsByDiscussionId(
    ids: {
      discussionId: string;
      userId: string;
    },
    options?: TFindDiscussionCommentsQueryParams & { maxDepth?: number; includeDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { discussionId, userId } = ids;
      const { maxDepth = 10, ...otherOptions } = options || {};

      const rootComments = await this.findCommentsWithStats(db, discussionId, userId, {
        ...otherOptions,
        isRoot: true,
      });

      let count = 0;
      if (rootComments.length === 0) {
        return { count: count, comments: [] };
      }

      for (const rootComment of rootComments) {
        if (rootComment.isDeleted === false) {
          count++;
        }
      }

      const descendantComments = await this.findCommentsWithStats(db, discussionId, userId, {
        ...otherOptions,
        isRoot: false,
      });

      const comments = rootComments.map((rootComment) => {
        const { count: replyCount, comments: replies } = this.buildCommentTree(
          descendantComments,
          rootComment.commentId,
          maxDepth
        );

        count += replyCount;

        return {
          ...rootComment,
          replies: replies,
        };
      });

      return {
        count,
        comments,
      };
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find comments by discussion id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
      );
    }
  }

  /**
   * Efficiently fetch all comments with their stats in a single query
   */
  private async findCommentsWithStats(
    db: TKyselyDB | TKyselyTransaction,
    discussionId: string,
    userId: string,
    options?: TFindDiscussionCommentsQueryParams & {
      includeDeleted?: boolean;
      isRoot?: boolean;
    }
  ) {
    const { includeDeleted, sort, limit, offset, isRoot } = options || {};

    let query = db
      .selectFrom('comment')
      .innerJoin('user', 'user.userId', 'comment.commentAuthorId')
      .innerJoin('role', 'role.roleId', 'user.userRoleId')
      .leftJoin('userCommentLike', (join) =>
        join.onRef('userCommentLike.userCommentLikeCommentId', '=', 'comment.commentId')
      )
      .leftJoin('comment as reply', (join) => {
        const jb = join.onRef('reply.commentParentCommentId', '=', 'comment.commentId');

        if (!includeDeleted) {
          jb.on('reply.commentDeletedTime', 'is', null);
        }

        return jb;
      })
      .leftJoin('userCommentLike as my_like', (join) =>
        join
          .onRef('my_like.userCommentLikeCommentId', '=', 'comment.commentId')
          .on('my_like.userCommentLikeUserId', '=', userId)
      )
      .leftJoin('comment as my_reply', (join) => {
        const jb = join
          .onRef('my_reply.commentParentCommentId', '=', 'comment.commentId')
          .on('my_reply.commentAuthorId', '=', userId);

        if (!includeDeleted) {
          jb.on('my_reply.commentDeletedTime', 'is', null);
        }

        return jb;
      })
      .leftJoin('userCommentReport', (join) =>
        join
          .onRef('userCommentReport.userCommentReportCommentId', '=', 'comment.commentId')
          .on('userCommentReport.userCommentReportReporterId', '=', userId)
          .on('userCommentReport.userCommentReportStatus', '=', UserCommentReportStatus.Reported)
      )
      .where('comment.commentDiscussionId', '=', discussionId)
      .where('comment.commentParentCommentId', isRoot ? 'is' : 'is not', null)
      .groupBy([
        'comment.commentId',
        'comment.commentDiscussionId',
        'comment.commentParentCommentId',
        'comment.commentContent',
        'comment.commentCreatedTime',
        'comment.commentUpdatedTime',
        'comment.commentDeletedTime',
        'user.userId',
        'user.userDisplayName',
        'user.userAvatarUrl',
        'role.roleName',
      ])
      .select((eb) => [
        'comment.commentId',
        'comment.commentDiscussionId as discussionId',
        'comment.commentParentCommentId',
        'comment.commentContent',
        'comment.commentCreatedTime',
        'comment.commentUpdatedTime',
        'comment.commentDeletedTime',
        jsonBuildObject({
          userId: eb.ref('user.userId'),
          userDisplayName: eb.ref('user.userDisplayName'),
          userAvatarUrl: eb.ref('user.userAvatarUrl'),
          roleName: eb.ref('role.roleName'),
        }).as('author'),
        eb.fn
          .coalesce(eb.fn.count<number>('userCommentLike.userCommentLikeId').distinct(), eb.val(0))
          .as('likeCount'),
        eb.fn
          .coalesce(eb.fn.count<number>('reply.commentId').distinct(), eb.val(0))
          .as('replyCount'),
        eb
          .case()
          .when(eb.fn.max<number | null>('my_like.userCommentLikeId'), 'is', null)
          .then(eb.val(false))
          .else(eb.val(true))
          .end()
          .$castTo<string>()
          .as('isLiked'),
        eb
          .case()
          .when(eb.fn.max<number | null>('my_reply.commentId'), 'is', null)
          .then(eb.val(false))
          .else(eb.val(true))
          .end()
          .$castTo<string>()
          .as('isReplied'),
        eb
          .case()
          .when(eb.fn.max<number | null>('userCommentReport.userCommentReportId'), 'is', null)
          .then(eb.val(false))
          .else(eb.val(true))
          .end()
          .$castTo<string>()
          .as('isReported'),
      ]);

    if (!includeDeleted) {
      query = query.where('comment.commentDeletedTime', 'is', null);
    }

    if (isRoot) {
      switch (sort) {
        case FindDiscussionCommentsSortOption.Oldest:
          query = query.orderBy('comment.commentCreatedTime', 'asc');
          break;
        case FindDiscussionCommentsSortOption.Liked:
          query = query.orderBy('likeCount', 'desc');
          break;
        default:
          query = query.orderBy('comment.commentCreatedTime', 'desc');
      }
    } else {
      query = query.orderBy('comment.commentCreatedTime', 'asc');
    }

    if (isRoot) {
      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }
    }

    const comments = await query.execute();

    return comments.map(({ commentDeletedTime, ...otherComment }) =>
      commentDeletedTime === null
        ? {
            ...otherComment,
            author: {
              ...otherComment.author,
              userAvatarUrl: getFullStorageUrl(otherComment.author.userAvatarUrl),
            },
            isLiked: otherComment.isLiked === 'true',
            isReplied: otherComment.isReplied === 'true',
            isReported: otherComment.isReported === 'true',
            isDeleted: false,
          }
        : {
            commentId: otherComment.commentId,
            commentParentCommentId: otherComment.commentParentCommentId,
            isDeleted: true,
          }
    );
  }

  /**
   * Build hierarchical comment tree from flat list
   * Optimized with Map for O(n) complexity
   */
  private buildCommentTree(
    flatComments: any[],
    parentId: string | null,
    maxDepth: number,
    currentDepth = 0
  ): { count: number; comments: any[] } {
    if (currentDepth >= maxDepth) {
      return { count: 0, comments: [] };
    }

    const comments = [];
    let count = 0;
    for (const flatComment of flatComments) {
      if (flatComment.commentParentCommentId !== parentId) continue;

      let replies = null;

      if (flatComment.isDeleted === false) {
        count++;
      }

      if (currentDepth < maxDepth - 1) {
        const { comments: repliesRes, count: replyCount } = this.buildCommentTree(
          flatComments,
          flatComment.commentId,
          maxDepth,
          currentDepth + 1
        );

        count += replyCount;
        replies = repliesRes;
      }

      comments.push({
        ...flatComment,
        replies,
      });
    }

    return {
      count,
      comments,
    };
  }

  async findUserComments(
    authorId: string,
    options?: Omit<TFindUserCommentsQueryParams, 'authorId'>,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { sort, limit = 500, offset = 0, type } = options || {};

      let query = db
        .with('base_comment', (eb) =>
          eb
            .selectFrom('comment')
            .where('comment.commentAuthorId', '=', authorId)
            .where('comment.commentDeletedTime', 'is', null)
            .where((eb) => {
              const ands: Expression<SqlBool>[] = [];

              if (type === FindUserCommentsType.Comments) {
                ands.push(eb('commentParentCommentId', 'is', null));
              } else if (type === FindUserCommentsType.Replies) {
                ands.push(eb('commentParentCommentId', 'is not', null));
              }

              return eb.length > 0 ? eb.and(ands) : sql`true`;
            })
            .selectAll()
        )
        .with('base_comment_like', (eb) =>
          eb
            .selectFrom('base_comment')
            .leftJoin(
              'userCommentLike',
              'userCommentLike.userCommentLikeCommentId',
              'base_comment.commentId'
            )
            .groupBy('base_comment.commentId')
            .select((eb) => [
              'base_comment.commentId',
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userCommentLike.userCommentLikeId').distinct(),
                  eb.val(0)
                )
                .as('likeCount'),
              eb
                .cast<boolean>(
                  eb.fn.max(
                    eb
                      .case()
                      .when(eb.ref('userCommentLike.userCommentLikeUserId'), '=', authorId)
                      .then(eb.val(1))
                      .else(eb.val(0))
                      .end()
                  ),
                  'boolean'
                )
                .as('isLiked'),
            ])
        )
        .with('base_comment_reply', (eb) =>
          eb
            .selectFrom('comment as reply')
            .where('reply.commentParentCommentId', 'in', (eb) =>
              eb.selectFrom('base_comment').select('base_comment.commentId')
            )
            .groupBy('reply.commentParentCommentId')
            .select((eb) => [
              'reply.commentParentCommentId',
              eb.fn
                .coalesce(eb.fn.count<number>('reply.commentId').distinct(), eb.val(0))
                .as('replyCount'),

              eb
                .cast<boolean>(
                  eb.fn.max(
                    eb
                      .case()
                      .when(eb.ref('reply.commentAuthorId'), '=', authorId)
                      .then(eb.val(1))
                      .else(eb.val(0))
                      .end()
                  ),
                  'boolean'
                )
                .as('isReplied'),
            ])
        )
        .with('base_comment_report', (eb) =>
          eb
            .selectFrom('userCommentReport')
            .where('userCommentReport.userCommentReportReporterId', '=', authorId)
            .where('userCommentReport.userCommentReportCommentId', 'in', (eb) =>
              eb.selectFrom('base_comment').select('base_comment.commentId')
            )
            .where(
              'userCommentReport.userCommentReportStatus',
              '=',
              UserCommentReportStatus.Reported
            )
            .select((eb) => [
              'userCommentReport.userCommentReportCommentId',
              eb.cast<boolean>(eb.val(1), 'boolean').as('isReported'),
            ])
        )
        .with('parent_comment', (eb) =>
          eb
            .selectFrom('comment')
            .innerJoin('user', 'user.userId', 'comment.commentAuthorId')
            .innerJoin('role', 'role.roleId', 'user.userRoleId')
            .leftJoin(
              'userCommentLike',
              'userCommentLike.userCommentLikeCommentId',
              'comment.commentId'
            )
            .leftJoin('comment as reply', 'reply.commentParentCommentId', 'comment.commentId')
            .where('comment.commentId', 'in', (eb) =>
              eb
                .selectFrom('base_comment')
                .where('base_comment.commentParentCommentId', 'is not', null)
                .select('base_comment.commentParentCommentId')
                .distinct()
            )
            .where('comment.commentDeletedTime', 'is', null)
            .groupBy([
              'comment.commentId',
              'comment.commentDiscussionId',
              'comment.commentParentCommentId',
              'comment.commentContent',
              'comment.commentCreatedTime',
              'comment.commentUpdatedTime',
              'user.userId',
              'user.userDisplayName',
              'user.userAvatarUrl',
              'role.roleName',
            ])
            .select((eb) => [
              'comment.commentId',
              'comment.commentDiscussionId',
              'comment.commentParentCommentId',
              'comment.commentContent',
              'comment.commentCreatedTime',
              'comment.commentUpdatedTime',
              jsonBuildObject({
                userId: eb.ref('user.userId'),
                userDisplayName: eb.ref('user.userDisplayName'),
                userAvatarUrl: eb.ref('user.userAvatarUrl'),
                roleName: eb.ref('role.roleName'),
              }).as('author'),
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userCommentLike.userCommentLikeId').distinct(),
                  eb.val(0)
                )
                .as('likeCount'),
              eb.fn
                .coalesce(eb.fn.count<number>('reply.commentId').distinct(), eb.val(0))
                .as('replyCount'),
              eb
                .cast<boolean>(
                  eb.fn.max(
                    eb
                      .case()
                      .when(eb.ref('userCommentLike.userCommentLikeUserId'), '=', authorId)
                      .then(eb.val(1))
                      .else(eb.val(0))
                      .end()
                  ),
                  'boolean'
                )
                .as('isLiked'),
              eb
                .cast<boolean>(
                  eb.fn.max(
                    eb
                      .case()
                      .when(eb.ref('reply.commentAuthorId'), '=', authorId)
                      .then(eb.val(1))
                      .else(eb.val(0))
                      .end()
                  ),
                  'boolean'
                )
                .as('isReplied'),
              eb.fn
                .coalesce(
                  eb
                    .exists(
                      eb
                        .selectFrom('userCommentReport')
                        .whereRef(
                          'userCommentReport.userCommentReportCommentId',
                          '=',
                          'comment.commentId'
                        )
                        .where('userCommentReport.userCommentReportReporterId', '=', authorId)
                        .where(
                          'userCommentReport.userCommentReportStatus',
                          '=',
                          UserCommentReportStatus.Reported
                        )
                    )
                    .$castTo<boolean>(),
                  eb.val(false)
                )
                .as('isReported'),
            ])
        )
        .with('base_discussion', (eb) =>
          eb
            .selectFrom('discussion')
            .innerJoin('user', 'user.userId', 'discussion.discussionAuthorId')
            .innerJoin('role', 'role.roleId', 'user.userRoleId')
            .leftJoin(
              'userDiscussionLike',
              'userDiscussionLike.userDiscussionLikeDiscussionId',
              'discussion.discussionId'
            )
            .leftJoin('comment', 'comment.commentDiscussionId', 'discussion.discussionId')
            .where('discussion.discussionStatus', '=', DiscussionStatus.Active)
            .where('discussion.discussionId', 'in', (eb) =>
              eb
                .selectFrom('base_comment')
                .where('base_comment.commentParentCommentId', 'is', null)
                .select('base_comment.commentDiscussionId')
                .distinct()
            )
            .groupBy([
              'discussion.discussionId',
              'discussion.discussionAuthorId',
              'discussion.discussionTitle',
              'discussion.discussionContent',
              'discussion.discussionStatus',
              'discussion.discussionCreatedTime',
              'discussion.discussionUpdatedTime',
              'user.userId',
              'user.userDisplayName',
              'user.userAvatarUrl',
              'role.roleName',
            ])
            .select((eb) => [
              'discussion.discussionId',
              'discussion.discussionAuthorId',
              'discussion.discussionTitle',
              'discussion.discussionContent',
              'discussion.discussionStatus',
              'discussion.discussionCreatedTime',
              'discussion.discussionUpdatedTime',
              jsonBuildObject({
                userId: eb.ref('user.userId'),
                userDisplayName: eb.ref('user.userDisplayName'),
                userAvatarUrl: eb.ref('user.userAvatarUrl'),
                roleName: eb.ref('role.roleName'),
              }).as('author'),
              eb.fn
                .coalesce(
                  eb.fn.count<number>('userDiscussionLike.userDiscussionLikeId').distinct(),
                  eb.val(0)
                )
                .as('likeCount'),
              eb.fn
                .coalesce(eb.fn.count<number>('comment.commentId').distinct(), eb.val(0))
                .as('commentCount'),
              eb
                .cast<boolean>(
                  eb.fn.max(
                    eb
                      .case()
                      .when(eb.ref('userDiscussionLike.userDiscussionLikeUserId'), '=', authorId)
                      .then(eb.val(1))
                      .else(eb.val(0))
                      .end()
                  ),
                  'boolean'
                )
                .as('isLiked'),
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
                        .where('userDiscussionReport.userDiscussionReportReporterId', '=', authorId)
                        .where(
                          'userDiscussionReport.userDiscussionReportStatus',
                          '=',
                          UserDiscussionReportStatus.Reported
                        )
                    )
                    .$castTo<boolean>(),
                  eb.val(false)
                )
                .as('isReported'),
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
        .selectFrom('base_comment')
        .innerJoin('user', 'user.userId', 'base_comment.commentAuthorId')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .leftJoin('base_comment_like', 'base_comment_like.commentId', 'base_comment.commentId')
        .leftJoin(
          'base_comment_reply',
          'base_comment_reply.commentParentCommentId',
          'base_comment.commentId'
        )
        .leftJoin(
          'base_comment_report',
          'base_comment_report.userCommentReportCommentId',
          'base_comment.commentId'
        )
        .leftJoin(
          'parent_comment',
          'parent_comment.commentId',
          'base_comment.commentParentCommentId'
        )
        .leftJoin(
          'base_discussion',
          'base_discussion.discussionId',
          'base_comment.commentDiscussionId'
        )
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
          'base_comment.commentId',
          'base_comment.commentDiscussionId as discussionId',
          'base_comment.commentParentCommentId',
          'base_comment.commentContent',
          'base_comment.commentCreatedTime',
          'base_comment.commentUpdatedTime',
          jsonBuildObject({
            userId: eb.ref('user.userId'),
            userDisplayName: eb.ref('user.userDisplayName'),
            userAvatarUrl: eb.ref('user.userAvatarUrl'),
            roleName: eb.ref('role.roleName'),
          }).as('author'),
          eb.fn.coalesce('base_comment_like.likeCount', eb.val(0)).as('likeCount'),
          eb.fn.coalesce('base_comment_reply.replyCount', eb.val(0)).as('replyCount'),
          eb.fn.coalesce('base_comment_like.isLiked', eb.val(false)).as('isLiked'),
          eb.fn.coalesce('base_comment_reply.isReplied', eb.val(false)).as('isReplied'),
          eb.fn.coalesce('base_comment_report.isReported', eb.val(false)).as('isReported'),
          eb
            .case()
            .when(eb.ref('base_comment.commentParentCommentId'), 'is', null)
            .then(
              jsonBuildObject({
                discussionId: eb.ref('base_discussion.discussionId'),
                discussionTitle: eb.ref('base_discussion.discussionTitle'),
                discussionContent: eb.ref('base_discussion.discussionContent'),
                discussionStatus: eb.ref('base_discussion.discussionStatus'),
                discussionCreatedTime: eb.ref('base_discussion.discussionCreatedTime'),
                discussionUpdatedTime: eb.ref('base_discussion.discussionUpdatedTime'),
                author: eb.ref('base_discussion.author'),
                interests: eb.ref('discussion_interest_agg.interests'),
                goals: eb.ref('discussion_goal_agg.goals'),
                likeCount: eb.ref('base_discussion.likeCount'),
                commentCount: eb.ref('base_discussion.commentCount'),
                isLiked: eb.ref('base_discussion.isLiked'),
                isReported: eb.ref('base_discussion.isReported'),
                attachmentPath: eb.ref('discussion_attachment.attachmentPath'),
                attachmentMimetype: eb.ref('discussion_attachment.attachmentMimetype'),
              })
            )
            .else(eb.val(null))
            .end()
            .as('discussion'),
          eb
            .case()
            .when(eb.ref('base_comment.commentParentCommentId'), 'is not', null)
            .then(
              jsonBuildObject({
                commentId: eb.ref('parent_comment.commentId'),
                discussionId: eb.ref('parent_comment.commentDiscussionId'),
                commentParentCommentId: eb.ref('parent_comment.commentParentCommentId'),
                commentContent: eb.ref('parent_comment.commentContent'),
                commentCreatedTime: eb.ref('parent_comment.commentCreatedTime'),
                commentUpdatedTime: eb.ref('parent_comment.commentUpdatedTime'),
                author: eb.ref('parent_comment.author'),
                likeCount: eb.ref('parent_comment.likeCount'),
                replyCount: eb.ref('parent_comment.replyCount'),
                isLiked: eb.ref('parent_comment.isLiked'),
                isReplied: eb.ref('parent_comment.isReplied'),
                isReported: eb.ref('parent_comment.isReported'),
              })
            )
            .else(eb.val(null))
            .end()
            .as('parentComment'),
        ]);

      switch (sort) {
        case FindUserCommentsSortOption.Oldest:
          query = query.orderBy('base_comment.commentCreatedTime', 'asc');
          break;
        case FindUserCommentsSortOption.Liked:
          query = query.orderBy('likeCount', 'desc');
          break;
        default:
          query = query.orderBy('base_comment.commentCreatedTime', 'desc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const commentAggs = await query.execute();

      return commentAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find user comments`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, authorId }
      );
    }
  }

  async findUserCommentsByLikeCount(
    userId: string,
    likeCount: number,
    options?: { minOrMax: 'min' | 'max' },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { minOrMax = 'min' } = options || {};

      let query = db
        .selectFrom('comment')
        .innerJoin(
          'userCommentLike',
          'userCommentLike.userCommentLikeCommentId',
          'comment.commentId'
        )
        .where('comment.commentAuthorId', '=', userId)
        .where('comment.commentDeletedTime', 'is', null)
        .select((eb) => [
          'comment.commentId',
          eb.fn.count<number>('userCommentLike.userCommentLikeId').as('commentLikeCount'),
        ])
        .groupBy('comment.commentId');

      query = query.having((eb) => {
        const commentLikeCount = eb.fn.count<number>('userCommentLike.userCommentLikeId');

        if (minOrMax === 'max') {
          return eb(commentLikeCount, '<=', likeCount);
        } else {
          return eb(commentLikeCount, '>=', likeCount);
        }
      });

      query = query.orderBy('comment.commentCreatedTime', 'asc');

      const comments = await query.execute();

      return comments;
    } catch (error) {
      throw new CustomHttpException(
        `[${CommentRepository.repoName}] | Fail to find user comments by like counts`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, likeCount, options }
      );
    }
  }
}
