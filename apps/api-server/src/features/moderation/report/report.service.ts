import { Injectable } from '@nestjs/common';
import { TReleaseReportedContentParams } from '@peernest/contract';
import {
  HttpErrorCode,
  IdPrefix,
  UserCommentReportStatus,
  UserDiscussionReportStatus,
} from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { UserCommentReportRepository } from '@/persistence/repos/comment';
import { UserDiscussionReportRepository } from '@/persistence/repos/discussion';
import { IClsStore } from '@/types/cls';

@Injectable()
export class ReportService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,

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
}
