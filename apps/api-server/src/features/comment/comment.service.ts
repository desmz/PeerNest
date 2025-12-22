import { Injectable } from '@nestjs/common';
import { TCreateCommentRo, TCreateCommentVo } from '@peernest/contract';
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

    const commentId = generateCommentId();
    const now = new Date();
    const comment = await this.commentRepository.createComment({
      ...otherCreateCommentRo,
      commentId: commentId,
      commentAuthorId: userId,
      commentDiscussionId: discussionId,
      commentCreatedTime: now,
    });

    return this.getCommentAgg(comment.commentId, userId);
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
