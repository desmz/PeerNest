import { Injectable } from '@nestjs/common';
import { generateCommentId, HttpErrorCode, UserCommentReportStatus } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableComment, TKyselyTransaction } from '@peernest/db';
import { DB } from '@peernest/db/types/db';
import { expressionBuilder } from 'kysely';
import { jsonBuildObject } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

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
}
