import { Injectable } from '@nestjs/common';
import {
  TDeleteDiscussionParams,
  TEditDiscussionParams,
  TEditDiscussionRo,
  TEditDiscussionVo,
  TGetDiscussionParams,
  TGetDiscussionQueryParams,
  TGetDiscussionVo,
  type TCreateDiscussionRo,
  type TCreateDiscussionVo,
} from '@peernest/contract';
import {
  AttachmentStatus,
  DiscussionStatus,
  generateDiscussionAttachmentId,
  generateDiscussionId,
  generateDiscussionInterestId,
  generateDiscussionPersonalGoalId,
  HttpErrorCode,
  UploadType,
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
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { getFullStorageUrl } from '@/features/attachment/utils';
import { AttachmentRepository } from '@/persistence/repos/attachment/attachment.repo';
import { DiscussionAttachmentRepository } from '@/persistence/repos/discussion/discussion-attachment.repo';
import { DiscussionInterestRepository } from '@/persistence/repos/discussion/discussion-interest.repo';
import { DiscussionPersonalGoalRepository } from '@/persistence/repos/discussion/discussion-personal-goal.repo';
import { DiscussionRepository } from '@/persistence/repos/discussion/discussion.repo';
import { InterestRepository } from '@/persistence/repos/system/interest.repo';
import { PersonalGoalRepository } from '@/persistence/repos/system/personal-goal.repo';
import { IClsStore } from '@/types/cls';

@Injectable()
export class DiscussionService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly kyselyService: KyselyService,
    private readonly clsService: ClsService<IClsStore>,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly interestRepository: InterestRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly discussionAttachmentRepository: DiscussionAttachmentRepository,
    private readonly discussionInterestRepository: DiscussionInterestRepository,
    private readonly discussionPersonalGoalRepository: DiscussionPersonalGoalRepository,
    private readonly personalGoalRepository: PersonalGoalRepository
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
        const ids: { discussionId: string; attachmentId: string } = { discussionId, attachmentId };

        const discussionAttachment =
          await this.discussionAttachmentRepository.findDiscussionAttachmentByIds(ids, tx);

        if (!discussionAttachment) {
          await this.discussionAttachmentRepository.deleteDiscussionAttachmentByDiscussionId(
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
      const bucket = StorageAdapter.getBucket(UploadType.Discussion);
      attachmentUrl = await this.storageAdapter.getPreviewUrl(
        bucket,
        attachment.attachmentPath,
        undefined,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        { 'Content-Type': attachment.attachmentMimetype }
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

    const now = new Date();
    await this.discussionRepository.updateDiscussionById(
      {
        discussionStatus: DiscussionStatus.Deleted,
        discussionDeletedTime: now,
      },
      discussionId
    );
  }
}
