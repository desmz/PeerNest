import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  TApproveBanRequestParams,
  TApproveBanRequestRo,
  TBanUserBase,
  TBanUserRo,
  TBanUserSchema,
  TCreateBanRequestRo,
  TFindBanUsersQueryParams,
  TFindBanUsersVo,
  TRejectBanRequestParams,
  TUnBanUserParams,
} from '@peernest/contract';
import {
  BanRequestProofResourceType,
  BanRequestStatus,
  COMMENT_REFERENCE_REGEX,
  DISCUSSION_REFERENCE_REGEX,
  DiscussionStatus,
  FindBanUsersStatus,
  generateBanActionId,
  generateBanRequestId,
  generateBanRequestProofId,
  HttpErrorCode,
  NOTIFICATION_EVENT,
} from '@peernest/core';
import { executeTx, KyselyService, TInsertableBanRequestProof } from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { AppConfig, type TAppConfig } from '@/configs/app.config';
import { CustomHttpException } from '@/custom.exception';
import { getFullStorageUrl } from '@/features/attachment/utils';
import {
  TBanRequestApprovedEvent,
  TBanRequestCreatedEvent,
  TBanRequestRejectedEvent,
  TUserBannedEvent,
  TUserUnbannedEvent,
} from '@/features/domain/events';
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
    @AppConfig() private readonly appConfig: TAppConfig,
    private readonly clsService: ClsService<IClsStore>,
    private readonly eventEmitter: EventEmitter2,
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

    const banRequestCreatedEvent: TBanRequestCreatedEvent = {
      banRequestId: banRequestId,
      requesterId: userId,
      bannedUserId: bannedUserId,
    };
    this.eventEmitter.emit(NOTIFICATION_EVENT.BAN_REQUEST_CREATED, banRequestCreatedEvent);
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

    const bantRequestApprovedEvent: TBanRequestApprovedEvent = {
      banRequestId: banRequestId,
      requesterId: requesterId,
      bannedUserId: banRequest.banRequestBannedUserId,
      resolverId: userId,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.BAN_APPROVED, bantRequestApprovedEvent);

    const userBannedEvent: TUserBannedEvent = {
      banActionId: banActionId,
      bannedUserId: banRequest.banRequestBannedUserId,
      bannedBy: userId,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.USER_BANNED, userBannedEvent);
  }

  async rejectBanRequest(rejectBanRequestParams: TRejectBanRequestParams): Promise<void> {
    const { banRequestId } = rejectBanRequestParams;

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

    const requesterId = banRequest.banRequestRequesterId;
    if (userId === requesterId) {
      throw new CustomHttpException(
        `You cannot reject your own ban request`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const now = new Date();
    await this.banRequestRepository.updateBanRequestById(
      {
        banRequestStatus: BanRequestStatus.Rejected,
        banRequestResolverId: userId,
        banRequestResolvedTime: now,
      },
      banRequestId
    );

    const banRequestRejectedEvent: TBanRequestRejectedEvent = {
      banRequestId: banRequestId,
      requesterId: requesterId,
      bannedUserId: banRequest.banRequestBannedUserId,
      resolverId: userId,
    };
    this.eventEmitter.emit(
      NOTIFICATION_EVENT.BAN_REJECTED,
      <TBanRequestRejectedEvent>banRequestRejectedEvent
    );
  }

  async banUser(banUserRo: TBanUserRo): Promise<void> {
    const { banEndTime, bannedUserId, reason } = banUserRo;

    const userId = this.clsService.get('user.id');

    const bannedUser = await this.userRepository.findUserById(bannedUserId);

    if (!bannedUser) {
      throw new CustomHttpException(`User ${bannedUserId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (bannedUserId === userId) {
      throw new CustomHttpException('You cannot ban yourself', HttpErrorCode.RESTRICTED_RESOURCE);
    }

    const now = new Date();
    const isBanned = await this.banActionRepository.validateIfUserIsBanned(bannedUserId, now);

    if (isBanned) {
      throw new CustomHttpException(
        `User ${bannedUserId} is already banned`,
        HttpErrorCode.CONFLICT
      );
    }

    const banActionId = generateBanActionId();
    await executeTx(this.kyselyService.db, async (tx) => {
      await this.banActionRepository.createBanAction(
        {
          banActionId: banActionId,
          banActionBannedUserId: bannedUserId,
          banActionBannedBy: userId,
          banActionReason: reason,
          banActionCreatedTime: now,
          banActionBanStartTime: now,
          banActionBanEndTime: banEndTime,
        },
        tx
      );

      await this.banRequestRepository.updateBanRequestsByBannedUserId(
        {
          banRequestStatus: BanRequestStatus.Approved,
          banRequestResolverId: userId,
          banRequestResolvedTime: now,
        },
        bannedUserId,
        {
          banRequestStatuses: [BanRequestStatus.Pending],
        },
        tx
      );
    });

    const userBannedEvent: TUserBannedEvent = {
      banActionId: banActionId,
      bannedUserId: bannedUserId,
      bannedBy: userId,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.USER_BANNED, userBannedEvent);
  }

  async unbanUser(unbanUserParams: TUnBanUserParams): Promise<void> {
    const { banActionId } = unbanUserParams;

    const banAction = await this.banActionRepository.findBanActionById(banActionId);

    if (!banAction) {
      throw new CustomHttpException(
        `Ban action ${banActionId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const now = new Date();
    const banEndTime = banAction.banActionBanEndTime;
    if (banEndTime && banEndTime < now) {
      throw new CustomHttpException(
        `Ban action ${banActionId} is already unbanned`,
        HttpErrorCode.CONFLICT
      );
    }

    await this.banActionRepository.updateBanActionById(
      {
        banActionBanEndTime: now,
        banActionUpdatedTime: now,
      },
      banActionId
    );

    const userUnbannedEvent: TUserUnbannedEvent = {
      banActionId: banAction.banActionId,
      unbannedUserId: banAction.banActionBannedUserId,
      unbannedBy: banAction.banActionBannedBy,
    };

    this.eventEmitter.emit(NOTIFICATION_EVENT.USER_UNBANNED, userUnbannedEvent);
  }

  async findBanUsers(findBanUsersQueryParams: TFindBanUsersQueryParams): Promise<TFindBanUsersVo> {
    const now = new Date();
    const banUserObjs = await this.banActionRepository.findBanUsers({
      ...findBanUsersQueryParams,
      banEndTime: now,
    });

    const formattedBanUserObjs = banUserObjs.map((banUserObj): TBanUserSchema => {
      const banUserBase: TBanUserBase = {
        banId: banUserObj.banId,
        status: banUserObj.status as FindBanUsersStatus,
        bannedUser: {
          userId: banUserObj.bannedUserId,
          userDisplayName: banUserObj.bannedUserDisplayname,
          userAvatarUrl: getFullStorageUrl(banUserObj.bannedUserAvatarUrl),
          roleName: banUserObj.bannedUserRoleName,
          pronoun: banUserObj.bannedUserPronoun,
          university: banUserObj.bannedUserUniversity,
          domain: banUserObj.bannedUserDomain,
          userInfoLookingFor: banUserObj.bannedUserLookingFor,
          interests: banUserObj.bannedUserInterest,
          personalGoals: banUserObj.bannedUserPersonalGoal,
        },
      };

      return banUserObj.status === FindBanUsersStatus.Review
        ? {
            ...banUserBase,
            banRequestRequesterId: banUserObj.banRequestRequesterId!,
            banRequestRequesterName: banUserObj.banRequestRequesterName!,
            banRequestStatus: banUserObj.banRequestStatus!,
            banRequestReason: banUserObj.banRequestReason!,
            banRequestCreatedTime: banUserObj.banRequestCreatedTime!,
            proofs: banUserObj.banRequestProofs.map((proof) =>
              this.buildProofUrl(
                proof.banRequestProofResourceId,
                proof.banRequestProofResourceType as BanRequestProofResourceType
              )
            ),
          }
        : {
            ...banUserBase,
            banActionBannedBy: banUserObj.banActionBannedBy!,
            bannedByUserName: banUserObj.bannedByUserName!,
            banActionReason: banUserObj.banActionReason!,
            banActionBanStartTime: banUserObj.banActionBanStartTime!,
            proofs: banUserObj.banActionProofs.map((proof) =>
              this.buildProofUrl(
                proof.banRequestProofResourceId,
                proof.banRequestProofResourceType as BanRequestProofResourceType
              )
            ),
          };
    });

    return {
      count: formattedBanUserObjs.length,
      bannedUsers: formattedBanUserObjs,
    };
  }

  private buildProofUrl(resourceId: string, resourceType: BanRequestProofResourceType) {
    const publicOrigin = this.appConfig.publicOrigin;

    // todo: complete the comment frontend url

    switch (resourceType) {
      case BanRequestProofResourceType.Discussion:
        return `${publicOrigin}/discussions/${resourceId}`;
      case BanRequestProofResourceType.Comment:
        return `${publicOrigin}/comments/${resourceId}`;
    }
  }
}
