import { Injectable } from '@nestjs/common';
import {
  TCreateCommentRo,
  TCreateCommentVo,
  TDeleteCommentParams,
  TEditCommentParams,
  TEditCommentRo,
  TEditCommentVo,
  TReplyCommentParams,
  TReplyCommentRo,
  TReplyCommentVo,
} from '@peernest/contract';
import { DiscussionStatus, generateCommentId, HttpErrorCode } from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { getFullStorageUrl } from '@/features/attachment/utils';
import { CommentRepository } from '@/persistence/repos/comment/comment.repo';
import { DiscussionRepository } from '@/persistence/repos/discussion/discussion.repo';
import { IClsStore } from '@/types/cls';

@Injectable()
export class CommentService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,

    private readonly commentRepository: CommentRepository,
    private readonly discussionRepository: DiscussionRepository
  ) {}

  async createComment(createCommentRo: TCreateCommentRo): Promise<TCreateCommentVo> {
    const { discussionId, ...otherCreateCommentRo } = createCommentRo;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} is not found`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const comment = await this.commentRepository.createComment({
      ...otherCreateCommentRo,
      commentId: generateCommentId(),
      commentAuthorId: userId,
      commentDiscussionId: discussionId,
      commentCreatedTime: now,
    });

    return this.getCommentAgg(comment.commentId, userId);
  }

  async replyComment(
    replyCommentParams: TReplyCommentParams,
    replyCommentRo: TReplyCommentRo
  ): Promise<TReplyCommentVo> {
    const { commentId: parentCommentId } = replyCommentParams;
    const { commentContent } = replyCommentRo;

    const userId = this.clsService.get('user.id');

    const parentComment = await this.commentRepository.findCommentById(parentCommentId);

    if (!parentComment) {
      throw new CustomHttpException(
        `Comment ${parentCommentId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const reply = await this.commentRepository.createComment({
      commentId: generateCommentId(),
      commentAuthorId: userId,
      commentDiscussionId: parentComment.commentDiscussionId,
      commentParentCommentId: parentComment.commentId,
      commentContent: commentContent,
      commentCreatedTime: now,
    });

    return this.getCommentAgg(reply.commentId, userId);
  }

  async editComment(
    editCommentParams: TEditCommentParams,
    editCommentRo: TEditCommentRo
  ): Promise<TEditCommentVo> {
    const { commentId } = editCommentParams;

    const userId = this.clsService.get('user.id');

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new CustomHttpException(`Comment ${commentId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (comment.commentAuthorId !== userId) {
      throw new CustomHttpException(
        'You are not the author of this comment',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.commentRepository.updateCommentById(
      {
        ...editCommentRo,
        commentUpdatedTime: now,
      },
      comment.commentId
    );

    return this.getCommentAgg(comment.commentId, userId);
  }

  async deleteComment(deleteCommentParams: TDeleteCommentParams): Promise<void> {
    const { commentId } = deleteCommentParams;

    const userId = this.clsService.get('user.id');

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new CustomHttpException(`Comment ${commentId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (comment.commentAuthorId !== userId) {
      throw new CustomHttpException(
        'You are not the author of this comment',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.commentRepository.updateCommentById(
      {
        commentDeletedTime: now,
      },
      comment.commentId
    );
  }

  private async getCommentAgg(commentId: string, userId: string) {
    const commentAgg = await this.commentRepository.findCommentAggByIds({
      commentId,
      userId,
    });

    if (!commentAgg) {
      throw new CustomHttpException('Cannot find comment agg', HttpErrorCode.INTERNAL_SERVER_ERROR);
    }

    return {
      ...commentAgg,
      author: {
        ...commentAgg.author,
        userAvatarUrl: getFullStorageUrl(commentAgg.author.userAvatarUrl),
      },
      likeCount: commentAgg.likeCount as number,
      replyCount: commentAgg.replyCount as number,
      isLiked: commentAgg.isLiked as boolean,
      isReplied: commentAgg.isReplied as boolean,
      isReported: commentAgg.isReported as boolean,
    };
  }
}
