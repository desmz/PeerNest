import { Injectable } from '@nestjs/common';
import { TDeleteReportedContentParams, TReleaseReportedContentParams } from '@peernest/contract';
import {
  DiscussionStatus,
  HttpErrorCode,
  IdPrefix,
  UserCommentReportStatus,
  UserDiscussionReportStatus,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { CommentRepository, UserCommentReportRepository } from '@/persistence/repos/comment';
import {
  DiscussionRepository,
  UserDiscussionReportRepository,
} from '@/persistence/repos/discussion';
import { IClsStore } from '@/types/cls';

@Injectable()
export class ReportService {
  constructor(
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
}
