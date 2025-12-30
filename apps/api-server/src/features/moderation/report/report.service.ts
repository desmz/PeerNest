import { Injectable } from '@nestjs/common';
import {
  TDeleteReportedContentParams,
  TFindReportedContentsQueryParams,
  TFindReportedContentsVo,
  TReleaseReportedContentParams,
  TReportedContent,
  TReportedContentBase,
} from '@peernest/contract';
import {
  DiscussionStatus,
  FindReportedContentsTypeOption,
  HttpErrorCode,
  IdPrefix,
  ReportedContentStatus,
  UploadType,
  UserCommentReportStatus,
  UserDiscussionReportStatus,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { getFullStorageUrl } from '@/features/attachment/utils';
import { CommentRepository, UserCommentReportRepository } from '@/persistence/repos/comment';
import {
  DiscussionRepository,
  UserDiscussionReportRepository,
} from '@/persistence/repos/discussion';
import { IClsStore } from '@/types/cls';

@Injectable()
export class ReportService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly commentRepository: CommentRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly userDiscussionReportRepository: UserDiscussionReportRepository,
    private readonly userCommentReportRepository: UserCommentReportRepository
  ) {}

  async releaseReportedContent(
    releaseReportedContentParams: TReleaseReportedContentParams
  ): Promise<void> {
    const { reportId } = releaseReportedContentParams;

    const userId = this.clsService.get('user.id');

    if (reportId.startsWith(IdPrefix.UserDiscussionReport)) {
      const userDiscussionReport =
        await this.userDiscussionReportRepository.findUserDiscussionReportById(reportId, {
          statuses: [UserDiscussionReportStatus.Reported, UserDiscussionReportStatus.Released],
        });

      if (!userDiscussionReport) {
        throw new CustomHttpException(
          `Discussion Report ${reportId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      if (userDiscussionReport.userDiscussionReportStatus === UserDiscussionReportStatus.Released) {
        throw new CustomHttpException(
          `Discussion Report ${reportId} is not in ${UserDiscussionReportStatus.Reported} mode`,
          HttpErrorCode.CONFLICT
        );
      }

      const now = new Date();
      await this.userDiscussionReportRepository.updateUserDiscussionReportById(
        {
          userDiscussionReportStatus: UserDiscussionReportStatus.Released,
          userDiscussionReportResolverId: userId,
          userDiscussionReportResolvedTime: now,
        },
        reportId
      );
    } else {
      const userCommentReport = await this.userCommentReportRepository.findUserCommentReportById(
        reportId,
        {
          statuses: [UserCommentReportStatus.Reported, UserCommentReportStatus.Released],
        }
      );

      if (!userCommentReport) {
        throw new CustomHttpException(
          `Comment Report ${reportId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      if (userCommentReport.userCommentReportStatus === UserCommentReportStatus.Released) {
        throw new CustomHttpException(
          `Comment Report ${reportId} is not in ${UserCommentReportStatus.Reported} mode`,
          HttpErrorCode.CONFLICT
        );
      }

      const now = new Date();
      await this.userCommentReportRepository.updateUserCommentReportById(
        {
          userCommentReportStatus: UserCommentReportStatus.Released,
          userCommentReportResolverId: userId,
          userCommentReportResolvedTime: now,
        },
        reportId
      );
    }
  }

  async deleteReportedContent(
    deleteReportedContentParams: TDeleteReportedContentParams
  ): Promise<void> {
    const { reportId } = deleteReportedContentParams;

    const userId = this.clsService.get('user.id');

    if (reportId.startsWith(IdPrefix.UserDiscussionReport)) {
      const userDiscussionReport =
        await this.userDiscussionReportRepository.findUserDiscussionReportById(reportId, {
          statuses: [UserDiscussionReportStatus.Reported, UserDiscussionReportStatus.Deleted],
        });

      if (!userDiscussionReport) {
        throw new CustomHttpException(
          `Discussion Report ${reportId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      if (userDiscussionReport.userDiscussionReportStatus === UserDiscussionReportStatus.Deleted) {
        throw new CustomHttpException(
          `Discussion Report ${reportId} is already in ${UserDiscussionReportStatus.Deleted} mode`,
          HttpErrorCode.CONFLICT
        );
      }

      const now = new Date();
      await executeTx(this.kyselyService.db, async (tx) => {
        await this.userDiscussionReportRepository.updateUserDiscussionReportById(
          {
            userDiscussionReportStatus: UserDiscussionReportStatus.Deleted,
            userDiscussionReportResolverId: userId,
            userDiscussionReportResolvedTime: now,
          },
          reportId,
          tx
        );

        await this.discussionRepository.updateDiscussionById(
          {
            discussionStatus: DiscussionStatus.Deleted,
            discussionDeletedBy: userId,
            discussionDeletedTime: now,
          },
          userDiscussionReport.userDiscussionReportDiscussionId,
          tx
        );
      });
    } else {
      const userCommentReport = await this.userCommentReportRepository.findUserCommentReportById(
        reportId,
        {
          statuses: [UserCommentReportStatus.Reported, UserCommentReportStatus.Deleted],
        }
      );

      if (!userCommentReport) {
        throw new CustomHttpException(
          `Comment Report ${reportId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      if (userCommentReport.userCommentReportStatus === UserCommentReportStatus.Deleted) {
        throw new CustomHttpException(
          `Comment Report ${reportId} is already in ${UserCommentReportStatus.Deleted} mode`,
          HttpErrorCode.CONFLICT
        );
      }

      const now = new Date();

      await executeTx(this.kyselyService.db, async (tx) => {
        await this.userCommentReportRepository.updateUserCommentReportById(
          {
            userCommentReportStatus: UserCommentReportStatus.Deleted,
            userCommentReportResolverId: userId,
            userCommentReportResolvedTime: now,
          },
          reportId,
          tx
        );

        await this.commentRepository.updateCommentById(
          {
            commentDeletedBy: userId,
            commentDeletedTime: now,
          },
          userCommentReport.userCommentReportCommentId,
          tx
        );
      });
    }
  }

  async findReportedContents(
    findReportedContentsQueryParams: TFindReportedContentsQueryParams
  ): Promise<TFindReportedContentsVo> {
    const reportedContents = await this.userDiscussionReportRepository.findReportedContents(
      findReportedContentsQueryParams
    );

    const formattedReportedContent = await Promise.all(
      reportedContents.map(async (reportedContent): Promise<TReportedContent> => {
        const reportedContentBase: TReportedContentBase = {
          reportId: reportedContent.reportId,
          type: reportedContent.type as FindReportedContentsTypeOption,
          reportStatus: reportedContent.reportStatus as ReportedContentStatus,
          reportedTime: reportedContent.reportedTime,
          reporter: reportedContent.reporter,
        };

        let attachmentUrl: string | null = null;

        if (reportedContent.attachmentPath) {
          const bucket = StorageAdapter.getBucket(UploadType.Discussion);

          const respHeaders: Record<string, string> = {};

          if (reportedContent.attachmentMimetype) {
            respHeaders['Content-Type'] = reportedContent.attachmentMimetype;
          }

          attachmentUrl = await this.storageAdapter.getPreviewUrl(
            bucket,
            reportedContent.attachmentPath,
            undefined,
            respHeaders
          );
        }

        const {
          discussionAuthor,
          discussionInterests,
          discussionGoals,
          commentAuthor,
          commentDiscussion,
        } = reportedContent;

        return reportedContent.type === FindReportedContentsTypeOption.Discussion
          ? {
              ...reportedContentBase,
              target: {
                discussionId: reportedContent.discussionId!,
                discussionTitle: reportedContent.discussionTitle!,
                discussionContent: reportedContent.discussionContent!,
                discussionStatus: reportedContent.discussionStatus as DiscussionStatus,
                discussionCreatedTime: reportedContent.discussionCreatedTime!,
                discussionUpdatedTime: reportedContent.discussionUpdatedTime,
                author: {
                  userId: discussionAuthor.userId!,
                  userDisplayName: discussionAuthor.userDisplayName!,
                  userAvatarUrl: getFullStorageUrl(discussionAuthor.userAvatarUrl!),
                  roleName: discussionAuthor.roleName!,
                },
                interests: discussionInterests!.map((interest) => ({
                  interestId: interest.interestId,
                  interestName: interest.interestName,
                  interestPosition: interest.interestPosition,
                })),
                goals: discussionGoals!.map((goals) => ({
                  personalGoalId: goals.personalGoalId,
                  personalGoalTitle: goals.personalGoalTitle,
                  personalGoalName: goals.personalGoalName,
                  personalGoalDescription: goals.personalGoalDescription,
                  personalGoalPosition: goals.personalGoalPosition,
                })),
                attachmentUrl: attachmentUrl,
              },
            }
          : {
              ...reportedContentBase,
              target: {
                commentId: reportedContent.commentId!,
                discussionId: reportedContent.commentDiscussionId!,
                commentParentCommentId: reportedContent.commentParentCommentId,
                commentContent: reportedContent.commentContent!,
                commentCreatedTime: reportedContent.commentCreatedTime!,
                commentUpdatedTime: reportedContent.commentUpdatedTime!,
                author: {
                  userId: commentAuthor.userId!,
                  userDisplayName: commentAuthor.userDisplayName!,
                  userAvatarUrl: getFullStorageUrl(commentAuthor.userAvatarUrl!),
                  roleName: commentAuthor.roleName!,
                },
                discussion: {
                  discussionId: commentDiscussion.discussionId!,
                  discussionTitle: commentDiscussion.discussionTitle!,
                },
              },
            };
      })
    );

    return {
      count: formattedReportedContent.length,
      reportedContents: formattedReportedContent,
    };
  }
}
