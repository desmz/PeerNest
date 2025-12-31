import { Injectable } from '@nestjs/common';
import {
  TApproveBanRequestParams,
  TApproveBanRequestRo,
  TCreateBanRequestRo,
} from '@peernest/contract';
import {
  BanRequestProofResourceType,
  BanRequestStatus,
  COMMENT_REFERENCE_REGEX,
  DISCUSSION_REFERENCE_REGEX,
  DiscussionStatus,
  generateBanActionId,
  generateBanRequestId,
  generateBanRequestProofId,
  HttpErrorCode,
} from '@peernest/core';
import { executeTx, KyselyService, TInsertableBanRequestProof } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import {
  BanActionRepository,
  BanRequestProofRepository,
  BanRequestRepository,
} from '@/persistence/repos/ban';
import { CommentRepository } from '@/persistence/repos/comment';
import { DiscussionRepository } from '@/persistence/repos/discussion';
import { UserRepository } from '@/persistence/repos/user';
import { IClsStore } from '@/types/cls';

@Injectable()
export class BanService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,
    private readonly kyselyService: KyselyService,

    private readonly banActionRepository: BanActionRepository,
    private readonly banRequestRepository: BanRequestRepository,
    private readonly banRequestProofRepository: BanRequestProofRepository,
    private readonly commentRepository: CommentRepository,
    private readonly discussionRepository: DiscussionRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createBanRequest(createBanRequestRo: TCreateBanRequestRo): Promise<void> {
    const { bannedUserId, reason, proofReferenceRaw } = createBanRequestRo;

    const userId = this.clsService.get('user.id');

    const bannedUser = await this.userRepository.findUserById(bannedUserId);

    if (!bannedUser) {
      throw new CustomHttpException(`User ${bannedUserId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (bannedUserId === userId) {
      throw new CustomHttpException(
        'You cannot submit ban request for yourself',
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    const isBanned = await this.banActionRepository.validateIfUserIsBanned(bannedUserId, now);

    if (isBanned) {
      throw new CustomHttpException(
        `User ${bannedUserId} is already banned`,
        HttpErrorCode.CONFLICT
      );
    }

    const existingPendingBanRequest = await this.banRequestRepository.findBanRequestByBannedUserId(
      bannedUserId,
      { banRequestStatuses: [BanRequestStatus.Pending] }
    );

    if (existingPendingBanRequest) {
      throw new CustomHttpException(
        `Ban request for user ${bannedUserId} is already in ${BanRequestStatus.Pending} mode`,
        HttpErrorCode.CONFLICT
      );
    }

    const banRequestId = generateBanRequestId();

    const discussionProofs: TInsertableBanRequestProof[] = [];
    for (const discussionMatch of proofReferenceRaw.matchAll(DISCUSSION_REFERENCE_REGEX)) {
      discussionProofs.push({
        banRequestProofId: generateBanRequestProofId(),
        banRequestProofBanRequestId: banRequestId,
        banRequestProofResourceId: discussionMatch[1],
        banRequestProofResourceType: BanRequestProofResourceType.Discussion,
        banRequestProofReferenceRaw: discussionMatch[0],
      });
    }

    const commentProofs: TInsertableBanRequestProof[] = [];
    for (const commentMatch of proofReferenceRaw.matchAll(COMMENT_REFERENCE_REGEX)) {
      commentProofs.push({
        banRequestProofId: generateBanRequestProofId(),
        banRequestProofBanRequestId: banRequestId,
        banRequestProofResourceId: commentMatch[1],
        banRequestProofResourceType: BanRequestProofResourceType.Comment,
        banRequestProofReferenceRaw: commentMatch[0],
      });
    }

    const discussionIdsFromProof = discussionProofs.map(
      (discussionProof) => discussionProof.banRequestProofResourceId
    );
    const discussions = await this.discussionRepository.findDiscussionsByIds(
      discussionIdsFromProof,
      { statuses: [DiscussionStatus.Active] }
    );

    const commentIdsFromProof = commentProofs.map(
      (commentProof) => commentProof.banRequestProofResourceId
    );
    const comments = await this.commentRepository.findCommentsByIds(commentIdsFromProof);

    if (!discussions || discussions.length !== discussionIdsFromProof.length) {
      throw new CustomHttpException(
        'Discussion(s) is not found',
        HttpErrorCode.UNPROCESSABLE_ENTITY,
        discussions
      );
    }

    if (!comments || comments.length !== commentIdsFromProof.length) {
      throw new CustomHttpException(
        'Comment(s) is not found',
        HttpErrorCode.UNPROCESSABLE_ENTITY,
        comments
      );
    }

    await executeTx(this.kyselyService.db, async (tx) => {
      await this.banRequestRepository.createBanRequest(
        {
          banRequestId: banRequestId,
          banRequestRequesterId: userId,
          banRequestBannedUserId: bannedUserId,
          banRequestStatus: BanRequestStatus.Pending,
          banRequestReason: reason,
          banRequestProofReferenceRaw: proofReferenceRaw,
          banRequestCreatedTime: now,
        },
        tx
      );

      await this.banRequestProofRepository.createBanRequestProofs(
        [...discussionProofs, ...commentProofs],
        tx
      );
    });
  }

  async approveBanRequest(
    approveBanRequestParams: TApproveBanRequestParams,
    approveBanRequestRo: TApproveBanRequestRo
  ): Promise<void> {
    const { banRequestId } = approveBanRequestParams;
    const { banEndTime } = approveBanRequestRo;

    const userId = this.clsService.get('user.id');

    const banRequest = await this.banRequestRepository.findBanRequestByBannedId(banRequestId);

    if (!banRequest) {
      throw new CustomHttpException(
        `Ban request ${banRequestId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (banRequest.banRequestStatus !== BanRequestStatus.Pending) {
      throw new CustomHttpException(
        `Ban request ${banRequestId} is not in ${BanRequestStatus.Pending} mode`,
        HttpErrorCode.CONFLICT
      );
    }

    const bannedUserId = banRequest.banRequestBannedUserId;
    const now = new Date();
    const isBanned = await this.banActionRepository.validateIfUserIsBanned(bannedUserId, now);

    if (isBanned) {
      throw new CustomHttpException(
        `User ${bannedUserId} is already banned`,
        HttpErrorCode.CONFLICT
      );
    }

    const requesterId = banRequest.banRequestRequesterId;
    if (userId === requesterId) {
      throw new CustomHttpException(
        `You cannot approve your own ban request`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const banActionId = generateBanActionId();
    await executeTx(this.kyselyService.db, async (tx) => {
      await this.banActionRepository.createBanAction(
        {
          banActionId: banActionId,
          banActionBannedUserId: bannedUserId,
          banActionBanRequestId: banRequestId,
          banActionBannedBy: userId,
          banActionReason: banRequest.banRequestReason,
          banActionCreatedTime: now,
          banActionBanStartTime: now,
          banActionBanEndTime: banEndTime,
        },
        tx
      );

      await this.banRequestRepository.updateBanRequestById(
        {
          banRequestStatus: BanRequestStatus.Approved,
          banRequestResolverId: userId,
          banRequestResolvedTime: now,
        },
        banRequestId,
        tx
      );
    });
  }
}
