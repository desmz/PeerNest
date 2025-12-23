import { Injectable } from '@nestjs/common';
import {
  TCreateCommentRo,
  TCreateCommentVo,
  TDeleteCommentParams,
  TEditCommentParams,
  TEditCommentRo,
  TEditCommentVo,
  TFindUserCommentsQueryParams,
  TFindUserCommentsVo,
  TLikeCommentParams,
  TReplyCommentParams,
  TReplyCommentRo,
  TReplyCommentVo,
  TReportCommentParams,
  TUnlikeCommentParams,
} from '@peernest/contract';
import {
  DiscussionStatus,
  generateCommentId,
  generateUserCommentLikeId,
  generateUserCommentReportId,
  HttpErrorCode,
  UploadType,
  UserCommentReportStatus,
  UserRole,
} from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { getFullStorageUrl } from '@/features/attachment/utils';
import { CommentRepository } from '@/persistence/repos/comment/comment.repo';
import { UserCommentLikeRepository } from '@/persistence/repos/comment/user-comment-like.repo';
import { UserCommentReportRepository } from '@/persistence/repos/comment/user-comment-report';
import { DiscussionRepository } from '@/persistence/repos/discussion/discussion.repo';
import { IClsStore } from '@/types/cls';

@Injectable()
export class CommentService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly clsService: ClsService<IClsStore>,

    private readonly commentRepository: CommentRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly userCommentLikeRepository: UserCommentLikeRepository,
    private readonly userCommentReportRepository: UserCommentReportRepository
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

  async likeComment(likeCommentParams: TLikeCommentParams): Promise<void> {
    const { commentId } = likeCommentParams;

    const userId = this.clsService.get('user.id');

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new CustomHttpException(`Comment ${commentId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (comment.commentAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot like your own comment`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.userCommentLikeRepository.createUserCommentLike(
      {
        userCommentLikeId: generateUserCommentLikeId(),
        userCommentLikeUserId: userId,
        userCommentLikeCommentId: comment.commentId,
        userCommentLikeCreatedTime: now,
      },
      { onConflictDoNothing: true }
    );
  }

  async unlikeComment(unlikeCommentParams: TUnlikeCommentParams): Promise<void> {
    const { commentId } = unlikeCommentParams;

    const userId = this.clsService.get('user.id');

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new CustomHttpException(`Comment ${commentId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (comment.commentAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot unlike your own comment`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    await this.userCommentLikeRepository.deleteUserCommentLikeByIds({ userId, commentId });
  }

  async reportComment(reportCommentParams: TReportCommentParams): Promise<void> {
    const { commentId } = reportCommentParams;

    const userId = this.clsService.get('user.id');

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) {
      throw new CustomHttpException(`Comment ${commentId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (comment.commentAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot report your own comment`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.userCommentReportRepository.createUserCommentReport(
      {
        userCommentReportId: generateUserCommentReportId(),
        userCommentReportReporterId: userId,
        userCommentReportCommentId: comment.commentId,
        userCommentReportStatus: UserCommentReportStatus.Reported,
        userCommentReportReportedTime: now,
      },
      { onConflictDoNothing: true }
    );
  }

  async findUserComments(
    findUserCommentsQueryParams: TFindUserCommentsQueryParams
  ): Promise<TFindUserCommentsVo> {
    const { authorId, ...otherFindUserCommentsQueryParams } = findUserCommentsQueryParams;

    const userId = this.clsService.get('user.id');
    const userRole = this.clsService.get('user.role');

    const allowedUserRole = [UserRole.Admin, UserRole.Moderator];
    if (authorId !== userId && !allowedUserRole.includes(userRole)) {
      throw new CustomHttpException(
        "You don't have permission to perform this action",
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const commentAggs = await this.commentRepository.findUserComments(
      userId,
      otherFindUserCommentsQueryParams
    );

    const formattedCommentAggs = await Promise.all(
      commentAggs.map(async ({ author, discussion, parentComment, ...otherCommentAgg }) => ({
        ...otherCommentAgg,
        author: {
          ...author,
          userAvatarUrl: getFullStorageUrl(author.userAvatarUrl),
        },
        discussion: discussion
          ? {
              ...discussion,
              author: {
                ...discussion.author,
                userAvatarUrl: getFullStorageUrl(discussion.author!.userAvatarUrl),
                // userAvatarUrl: discussion.author?.userAvatarUrl
                //   ? getFullStorageUrl(discussion.author?.userAvatarUrl)
                //   : '',
              },
              attachmentUrl: discussion.attachmentPath
                ? await this.storageAdapter.getPreviewUrl(
                    StorageAdapter.getBucket(UploadType.Discussion),
                    discussion.attachmentPath,
                    undefined,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    { 'Content-Type': discussion.attachmentMimetype }
                  )
                : null,
            }
          : null,
        parentComment: parentComment
          ? {
              ...parentComment,
              author: {
                ...parentComment.author,
                userAvatarUrl: getFullStorageUrl(parentComment.author!.userAvatarUrl),
                // userAvatarUrl: parentComment.author?.userAvatarUrl
                //   ? getFullStorageUrl(parentComment.author?.userAvatarUrl)
                //   : '',
              },
            }
          : null,
      }))
    );

    return {
      count: formattedCommentAggs.length,
      comments: formattedCommentAggs,
    } as TFindUserCommentsVo;
  }
}
