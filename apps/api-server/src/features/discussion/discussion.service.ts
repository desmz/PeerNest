import { Injectable } from '@nestjs/common';
import {
  TArchiveDiscussionParams,
  TDeleteDiscussionParams,
  TEditDiscussionParams,
  TEditDiscussionRo,
  TEditDiscussionVo,
  TFindArchivedDiscussionsQueryParams,
  TFindArchivedDiscussionVo,
  TFindDiscussionCommentsParams,
  TFindDiscussionCommentsQueryParams,
  TFindDiscussionCommentsVo,
  TFindDiscussionsQueryParams,
  TFindDiscussionsVo,
  TGetDiscussionParams,
  TGetDiscussionQueryParams,
  TGetDiscussionVo,
  TLikeDiscussionParams,
  TReportDiscussionParams,
  TUnarchiveDiscussionParams,
  TUnlikeDiscussionParams,
  type TCreateDiscussionRo,
  type TCreateDiscussionVo,
} from '@peernest/contract';
import {
  ALLOWED_DELETE_DISCUSSION_USER_ROLE,
  AttachmentStatus,
  DiscussionStatus,
  generateDiscussionAttachmentId,
  generateDiscussionId,
  generateDiscussionInterestId,
  generateDiscussionPersonalGoalId,
  generateUserCommentLikeId,
  generateUserDiscussionReportId,
  HttpErrorCode,
  UploadType,
  UserDiscussionReportStatus,
} from '@peernest/core';
import {
  executeTx,
  KyselyService,
  TInsertableDiscussionInterest,
  TInsertableDiscussionPersonalGoal,
  TSelectableAttachment,
} from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { AchievementService } from '@/features/achievement/achievement.service';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { getAttachmentPreviewUrl, getFullStorageUrl } from '@/features/attachment/utils';
import { AttachmentRepository } from '@/persistence/repos/attachment';
import { CommentRepository } from '@/persistence/repos/comment';
import {
  DiscussionAttachmentRepository,
  DiscussionInterestRepository,
  DiscussionPersonalGoalRepository,
  DiscussionRepository,
  UserDiscussionLikeRepository,
  UserDiscussionReportRepository,
} from '@/persistence/repos/discussion';
import { InterestRepository, PersonalGoalRepository } from '@/persistence/repos/system';
import { IClsStore } from '@/types/cls';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly commentRepository: CommentRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly discussionAttachmentRepository: DiscussionAttachmentRepository,
    private readonly discussionInterestRepository: DiscussionInterestRepository,
    private readonly discussionPersonalGoalRepository: DiscussionPersonalGoalRepository,
    private readonly interestRepository: InterestRepository,
    private readonly personalGoalRepository: PersonalGoalRepository,
    private readonly userDiscussionLikeRepository: UserDiscussionLikeRepository,
    private readonly userDiscussionReportRepository: UserDiscussionReportRepository,

    private readonly achievementService: AchievementService
  ) {}

  async createDiscussion(createDiscussionRo: TCreateDiscussionRo): Promise<TCreateDiscussionVo> {
    const { interestIds, goalIds, attachmentId, ...otherCreateDiscussionRo } = createDiscussionRo;

    const userId = this.clsService.get('user.id');

    let attachment: TSelectableAttachment | undefined;
    if (attachmentId) {
      attachment = await this.attachmentRepository.findAttachmentById(attachmentId, {
        status: AttachmentStatus.Ready,
      });

      if (!attachment) {
        throw new CustomHttpException(
          `Attachment ${attachmentId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }
    }

    const systemPersonalGoalRows = await this.personalGoalRepository.findPersonalGoals();
    const systemPersonalGoal = new Set(
      systemPersonalGoalRows.map((systemPersonalGoalRow) => systemPersonalGoalRow.personalGoalId)
    );
    const filteredPersonalGoalIds = goalIds?.filter((personalGoalId) =>
      systemPersonalGoal.has(personalGoalId)
    );

    const systemInterestRows = await this.interestRepository.findInterests();
    const systemInterest = new Set(
      systemInterestRows.map((systemInterestRow) => systemInterestRow.interestId)
    );
    const filteredInterestIds = interestIds?.filter((interestId) => systemInterest.has(interestId));

    const discussionId = generateDiscussionId();
    const now = new Date();
    await executeTx(this.kyselyService.db, async (tx) => {
      await this.discussionRepository.createDiscussion(
        {
          ...otherCreateDiscussionRo,
          discussionId: discussionId,
          discussionAuthorId: userId,
          discussionStatus: DiscussionStatus.Active,
          discussionCreatedTime: now,
        },
        tx
      );

      if (attachmentId) {
        await this.discussionAttachmentRepository.createDiscussionAttachment(
          {
            discussionAttachmentId: generateDiscussionAttachmentId(),
            discussionAttachmentDiscussionId: discussionId,
            discussionAttachmentAttachmentId: attachmentId,
          },
          tx
        );
      }

      if (filteredPersonalGoalIds && filteredPersonalGoalIds.length > 0) {
        const discussionPersonalGoalObjs: TInsertableDiscussionPersonalGoal[] =
          filteredPersonalGoalIds.map((personalGoalId, idx) => ({
            discussionPersonalGoalId: generateDiscussionPersonalGoalId(),
            discussionPersonalGoalDiscussionId: discussionId,
            discussionPersonalGoalPersonalGoalId: personalGoalId,
            discussionPersonalGoalPosition: idx + 1,
          }));

        await this.discussionPersonalGoalRepository.createDiscussionPersonalGoals(
          discussionPersonalGoalObjs,
          undefined,
          tx
        );
      }

      if (filteredInterestIds && filteredInterestIds.length > 0) {
        const discussionInterestObjs: TInsertableDiscussionInterest[] = filteredInterestIds.map(
          (interestId, idx) => ({
            discussionInterestId: generateDiscussionInterestId(),
            discussionInterestDiscussionId: discussionId,
            discussionInterestInterestId: interestId,
            discussionInterestPosition: idx + 1,
          })
        );

        await this.discussionInterestRepository.createDiscussionInterests(
          discussionInterestObjs,
          undefined,
          tx
        );
      }
    });

    this.achievementService.evaluateImmediate(userId, ['makeDiscussion']);

    return this.getDiscussionAgg(discussionId, userId, attachment);
  }

  async getDiscussion(
    getDiscussionParams: TGetDiscussionParams,
    getDiscussionQueryParams: TGetDiscussionQueryParams
  ): Promise<TGetDiscussionVo> {
    const { discussionId } = getDiscussionParams;
    const { statuses } = getDiscussionQueryParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: statuses || undefined,
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    let attachment;
    if (discussion.attachmentId) {
      attachment = await this.attachmentRepository.findAttachmentById(discussion.attachmentId, {
        status: AttachmentStatus.Ready,
      });
    }

    return this.getDiscussionAgg(discussionId, userId, attachment);
  }

  async editDiscussion(
    editDiscussionParams: TEditDiscussionParams,
    editDiscussionRo: TEditDiscussionRo
  ): Promise<TEditDiscussionVo> {
    const { discussionId } = editDiscussionParams;
    const { attachmentId, goalIds, interestIds, ...otherEditDiscussionRo } = editDiscussionRo;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionAuthorId !== userId) {
      throw new CustomHttpException(
        `You are not the author of this discussion`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    let attachment: TSelectableAttachment | undefined;
    if (attachmentId) {
      attachment = await this.attachmentRepository.findAttachmentById(attachmentId, {
        status: AttachmentStatus.Ready,
      });

      if (!attachment) {
        throw new CustomHttpException(
          `Attachment ${attachmentId} does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }
    }

    const systemPersonalGoalRows = await this.personalGoalRepository.findPersonalGoals();
    const systemPersonalGoal = new Set(
      systemPersonalGoalRows.map((systemPersonalGoalRow) => systemPersonalGoalRow.personalGoalId)
    );
    const filteredPersonalGoalIds = goalIds?.filter((personalGoalId) =>
      systemPersonalGoal.has(personalGoalId)
    );

    const systemInterestRows = await this.interestRepository.findInterests();
    const systemInterest = new Set(
      systemInterestRows.map((systemInterestRow) => systemInterestRow.interestId)
    );
    const filteredInterestIds = interestIds?.filter((interestId) => systemInterest.has(interestId));

    const now = new Date();
    await executeTx(this.kyselyService.db, async (tx) => {
      await this.discussionRepository.updateDiscussionById(
        {
          ...otherEditDiscussionRo,
          discussionUpdatedTime: now,
        },
        discussionId,
        tx
      );

      if (attachmentId) {
        const discussionAttachment =
          await this.discussionAttachmentRepository.findDiscussionAttachmentByIds(
            { discussionId, attachmentId },
            tx
          );

        if (!discussionAttachment) {
          await this.discussionAttachmentRepository.deleteDiscussionAttachmentsByDiscussionId(
            discussionId,
            tx
          );

          await this.discussionAttachmentRepository.createDiscussionAttachment(
            {
              discussionAttachmentId: generateDiscussionAttachmentId(),
              discussionAttachmentDiscussionId: discussionId,
              discussionAttachmentAttachmentId: attachmentId,
            },
            tx
          );
        }
      } else {
        await this.discussionAttachmentRepository.deleteDiscussionAttachmentsByDiscussionId(
          discussionId,
          tx
        );
      }

      if (filteredPersonalGoalIds && filteredPersonalGoalIds.length > 0) {
        await this.discussionPersonalGoalRepository.deleteDiscussionPersonalGoals(
          {
            discussionPersonalGoalDiscussionId: discussionId,
            discussionPersonalGoalPersonalGoalIds: filteredPersonalGoalIds,
          },
          { isExcludePersonalGoalIds: true },
          tx
        );

        let basePos = await this.discussionPersonalGoalRepository.findMaxPositionByDiscussionId(
          discussionId,
          tx
        );

        if (basePos === -1) {
          basePos = 0;
        }

        const discussionPersonalGoalObjs: TInsertableDiscussionPersonalGoal[] =
          filteredPersonalGoalIds.map((personalGoalId, idx) => ({
            discussionPersonalGoalId: generateDiscussionPersonalGoalId(),
            discussionPersonalGoalDiscussionId: discussionId,
            discussionPersonalGoalPersonalGoalId: personalGoalId,
            discussionPersonalGoalPosition: basePos + idx + 1,
          }));

        await this.discussionPersonalGoalRepository.createDiscussionPersonalGoals(
          discussionPersonalGoalObjs,
          { onConflictDoNothing: true },
          tx
        );
      }

      if (filteredInterestIds && filteredInterestIds.length > 0) {
        await this.discussionInterestRepository.deleteDiscussionInterests(
          {
            discussionInterestDiscussionId: discussionId,
            discussionInterestInterestIds: filteredInterestIds,
          },
          { isExcludeInterestIds: true },
          tx
        );

        let basePos = await this.discussionInterestRepository.findMaxPositionByDiscussionId(
          discussionId,
          tx
        );

        if (basePos === -1) {
          basePos = 0;
        }

        const discussionInterestObjs: TInsertableDiscussionInterest[] = filteredInterestIds.map(
          (interestId, idx) => ({
            discussionInterestId: generateDiscussionInterestId(),
            discussionInterestDiscussionId: discussionId,
            discussionInterestInterestId: interestId,
            discussionInterestPosition: basePos + idx + 1,
          })
        );

        await this.discussionInterestRepository.createDiscussionInterests(
          discussionInterestObjs,
          { onConflictDoNothing: true },
          tx
        );
      }
    });

    return this.getDiscussionAgg(discussionId, userId, attachment);
  }

  private async getDiscussionAgg(
    discussionId: string,
    userId: string,
    attachment?: TSelectableAttachment
  ) {
    const discussionAgg = await this.discussionRepository.findDiscussionAggByIds({
      userId,
      discussionId,
    });

    if (!discussionAgg) {
      throw new CustomHttpException(
        'Cannot find discussion agg',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    let attachmentUrl: string | null = null;
    if (attachment) {
      attachmentUrl = await getAttachmentPreviewUrl(
        this.storageAdapter,
        UploadType.Discussion,
        attachment.attachmentPath,
        attachment.attachmentMimetype
      );
    }

    return {
      ...discussionAgg,
      author: {
        ...discussionAgg.author,
        userAvatarUrl: getFullStorageUrl(discussionAgg.author.userAvatarUrl),
      },
      discussionStatus: discussionAgg.discussionStatus as DiscussionStatus,
      likeCount: discussionAgg.likeCount as number,
      commentCount: discussionAgg.commentCount as number,
      isLiked: discussionAgg.isLiked as boolean,
      isReported: discussionAgg.isReported as boolean,
      attachmentUrl: attachmentUrl,
    };
  }

  async deleteDiscussion(deleteDiscussionParams: TDeleteDiscussionParams) {
    const { discussionId } = deleteDiscussionParams;

    const userId = this.clsService.get('user.id');
    const userRole = this.clsService.get('user.role');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (
      discussion.discussionAuthorId !== userId &&
      !ALLOWED_DELETE_DISCUSSION_USER_ROLE.includes(userRole)
    ) {
      throw new CustomHttpException(
        `You must be the author or have the role of ${ALLOWED_DELETE_DISCUSSION_USER_ROLE.join(', ')} to delete the discussion`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.discussionRepository.updateDiscussionById(
      {
        discussionStatus: DiscussionStatus.Deleted,
        discussionDeletedBy: userId,
        discussionDeletedTime: now,
      },
      discussionId
    );
  }

  async likeDiscussion(likeDiscussionParams: TLikeDiscussionParams) {
    const { discussionId } = likeDiscussionParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot like your own discussion`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.userDiscussionLikeRepository.createUserDiscussionLike(
      {
        userDiscussionLikeId: generateUserCommentLikeId(),
        userDiscussionLikeUserId: userId,
        userDiscussionLikeDiscussionId: discussionId,
        userDiscussionLikeCreatedTime: now,
      },
      { onConflictDoNothing: true }
    );
  }

  async unlikeDiscussion(unlikeDiscussionParams: TUnlikeDiscussionParams) {
    const { discussionId } = unlikeDiscussionParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot unlike your own discussion`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    await this.userDiscussionLikeRepository.deleteUserDiscussionLikeByIds({ userId, discussionId });
  }

  async reportDiscussion(reportDiscussionParams: TReportDiscussionParams) {
    const { discussionId } = reportDiscussionParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionAuthorId === userId) {
      throw new CustomHttpException(
        `You cannot report your own discussion`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.userDiscussionReportRepository.createUserDiscussionReport(
      {
        userDiscussionReportId: generateUserDiscussionReportId(),
        userDiscussionReportReporterId: userId,
        userDiscussionReportDiscussionId: discussionId,
        userDiscussionReportStatus: UserDiscussionReportStatus.Reported,
        userDiscussionReportReportedTime: now,
      },
      { onConflictDoNothing: true }
    );
  }

  async findDiscussionComments(
    findDiscussionCommentsParams: TFindDiscussionCommentsParams,
    findDiscussionCommentsQueryParams: TFindDiscussionCommentsQueryParams
  ): Promise<TFindDiscussionCommentsVo> {
    const { discussionId } = findDiscussionCommentsParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const commentAggs = await this.commentRepository.findCommentsByDiscussionId(
      { discussionId, userId },
      {
        ...findDiscussionCommentsQueryParams,
        includeDeleted: true,
        maxDepth: 50,
      }
    );

    return commentAggs as TFindDiscussionCommentsVo;
  }

  async findDiscussions(
    findDiscussionsQueryParams: TFindDiscussionsQueryParams
  ): Promise<TFindDiscussionsVo> {
    const userId = this.clsService.get('user.id');

    const discussionAggs = await this.discussionRepository.findDiscussions(
      userId,
      findDiscussionsQueryParams
    );

    const formattedDiscussionAggs = await Promise.all(
      discussionAggs.map(
        async ({ attachmentMimetype, attachmentPath, author, ...otherDiscussionAgg }) => ({
          ...otherDiscussionAgg,
          author: {
            ...author,
            userAvatarUrl: getFullStorageUrl(author.userAvatarUrl),
          },
          attachmentUrl: await getAttachmentPreviewUrl(
            this.storageAdapter,
            UploadType.Discussion,
            attachmentPath,
            attachmentMimetype
          ),
        })
      )
    );

    return {
      count: formattedDiscussionAggs.length,
      discussions: formattedDiscussionAggs,
    } as TFindDiscussionsVo;
  }

  async archiveDiscussion(archiveDiscussionParams: TArchiveDiscussionParams): Promise<void> {
    const { discussionId } = archiveDiscussionParams;

    const userId = this.clsService.get('user.id');

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active, DiscussionStatus.Archived],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionStatus === DiscussionStatus.Archived) {
      throw new CustomHttpException(
        `Discussion ${discussionId} is already in ${DiscussionStatus.Archived} mode`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    await this.discussionRepository.updateDiscussionById(
      {
        discussionStatus: DiscussionStatus.Archived,
        discussionArchivedTime: now,
        discussionArchivedBy: userId,
      },
      discussionId
    );
  }

  async unarchiveDiscussion(unarchiveDiscussionParams: TUnarchiveDiscussionParams): Promise<void> {
    const { discussionId } = unarchiveDiscussionParams;

    const discussion = await this.discussionRepository.findDiscussionById(discussionId, {
      statuses: [DiscussionStatus.Active, DiscussionStatus.Archived],
    });

    if (!discussion) {
      throw new CustomHttpException(
        `Discussion ${discussionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (discussion.discussionStatus === DiscussionStatus.Active) {
      throw new CustomHttpException(
        `Discussion ${discussionId} is not in ${DiscussionStatus.Archived} mode`,
        HttpErrorCode.CONFLICT
      );
    }

    await this.discussionRepository.updateDiscussionById(
      {
        discussionStatus: DiscussionStatus.Active,
        discussionArchivedTime: null,
        discussionArchivedBy: null,
      },
      discussionId
    );
  }

  async findArchivedDiscussions(
    findArchivedDiscussionsQueryParams: TFindArchivedDiscussionsQueryParams
  ): Promise<TFindArchivedDiscussionVo> {
    const discussionAggs = await this.discussionRepository.findArchivedDiscussions(
      findArchivedDiscussionsQueryParams
    );

    const formattedDiscussions = await Promise.all(
      discussionAggs.map(
        async ({ attachmentMimetype, attachmentPath, author, ...otherDiscussionAgg }) => ({
          ...otherDiscussionAgg,
          author: {
            ...author,
            userAvatarUrl: getFullStorageUrl(author.userAvatarUrl),
          },
          attachmentUrl: await getAttachmentPreviewUrl(
            this.storageAdapter,
            UploadType.Discussion,
            attachmentPath,
            attachmentMimetype
          ),
        })
      )
    );

    return {
      count: formattedDiscussions.length,
      discussions: formattedDiscussions,
    } as TFindArchivedDiscussionVo;
  }
}
