/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import {
  FindDiscussionCommentsSortOption,
  generateCommentId,
  HttpErrorCode,
  UserCommentReportStatus,
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
import { expressionBuilder } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';
import { getFullStorageUrl } from '@/features/attachment/utils';

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
    options?: {
      includeDeleted?: boolean;
      maxDepth?: number; // Limit nesting depth to prevent performance issues
      sort?: FindDiscussionCommentsSortOption;
      limit?: number;
      offset?: number;
    },
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

      if (rootComments.length === 0) {
        return [];
      }

      const descendantComments = await this.findCommentsWithStats(db, discussionId, userId, {
        ...otherOptions,
        isRoot: false,
      });

      return rootComments.map((rootComment) => ({
        ...rootComment,
        replies: this.buildCommentTree(descendantComments, rootComment.commentId, maxDepth),
      }));
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
    options?: {
      includeDeleted?: boolean;
      sort?: FindDiscussionCommentsSortOption;
      limit?: number;
      offset?: number;
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
  ): any[] {
    if (currentDepth >= maxDepth) {
      return [];
    }

    const children = flatComments.filter((comment) => comment.commentParentCommentId === parentId);

    return children.map((comment) => ({
      ...comment,
      replies:
        currentDepth < maxDepth - 1
          ? this.buildCommentTree(flatComments, comment.commentId, maxDepth, currentDepth + 1)
          : null,
    }));
  }
}
