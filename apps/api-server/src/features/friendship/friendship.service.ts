import { Injectable } from '@nestjs/common';
import {
  TAcceptFriendRequestParams,
  TAcceptFriendRequestVo,
  TGetFriendRequest,
  TGetFriendRequestQueryParams,
  TGetFriendRequestVo,
  TRejectFriendRequestParams,
  TSendFriendRequestRo,
  TSendFriendRequestVo,
} from '@peernest/contract';
import {
  ConversationParticipantRole,
  ConversationType,
  FriendRequestStatus,
  generateConversationId,
  generateConversationParticipantId,
  generateFriendRequestId,
  generateRelationshipId,
  GetFriendRequestsType,
  HttpErrorCode,
  RelationshipType,
} from '@peernest/core';
import {
  executeTx,
  KyselyService,
  TInsertableConversationParticipant,
  TUpdatableConversationParticipant,
  TUpdatableFriendRequest,
} from '@peernest/db';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { ConversationParticipantRepository } from '@/features/conversation/repo/conversation-participant.repo';
import { ConversationRepository } from '@/features/conversation/repo/conversation.repo';
import { UserRepository } from '@/features/user/repos/user.repo';
import { IClsStore } from '@/types/cls';

import { getFullStorageUrl } from '../attachment/utils';

import { FriendRequestRepository } from './repo/friend-request.repo';
import { RelationshipRepository } from './repo/relationship.repo';
import { TGetFriendRequestsByUserIdOptions } from './types';

@Injectable()
export class FriendShipService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,
    private readonly kyselyService: KyselyService,

    private readonly conversationRepository: ConversationRepository,
    private readonly conversationParticipantRepository: ConversationParticipantRepository,
    private readonly friendRequestRepository: FriendRequestRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly userRepository: UserRepository
  ) {}

  async sendFriendRequest(
    sendFriendRequestRo: TSendFriendRequestRo
  ): Promise<TSendFriendRequestVo> {
    const { toId } = sendFriendRequestRo;
    const userId = this.clsService.get('user.id');

    if (userId === toId) {
      throw new CustomHttpException(
        'You cannot send the friend request to yourself',
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const toUser = await this.userRepository.findUserById(toId);

    if (!toUser) {
      throw new CustomHttpException(`User ${toId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (toUser.userDeletedTime) {
      throw new CustomHttpException(
        `User ${toId} is disabled or deleted`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    // todo: add ban check

    const existingFriendRelationship = await this.relationshipRepository.findRelationshipByUserIds(
      {
        userIdA: userId,
        userIdB: toId,
      },
      { relationshipType: RelationshipType.Friend }
    );

    if (existingFriendRelationship) {
      throw new CustomHttpException(
        `You have already have relationship with ${toUser.userDisplayName}`,
        HttpErrorCode.CONFLICT
      );
    }

    const [existingFriendRequest, reverseFriendRequest] = await Promise.all([
      await this.friendRequestRepository.findFriendRequestByUserIds(
        { fromId: userId, toId },
        { status: FriendRequestStatus.Pending }
      ),
      await this.friendRequestRepository.findFriendRequestByUserIds(
        { fromId: toId, toId: userId },
        { status: FriendRequestStatus.Pending }
      ),
    ]);

    if (existingFriendRequest) {
      throw new CustomHttpException(
        `You already sent the friend request to ${toUser.userDisplayName}`,
        HttpErrorCode.CONFLICT
      );
    }

    if (reverseFriendRequest) {
      const conversationId = await this.processCreateFriendShip({ fromId: userId, toId }, true);

      return {
        isAutoMatch: true,
        conversationId,
      };
    }

    const now = new Date();
    await this.friendRequestRepository.createFriendRequest({
      friendRequestId: generateFriendRequestId(),
      friendRequestFromId: userId,
      friendRequestToId: toId,
      friendRequestStatus: FriendRequestStatus.Pending,
      friendRequestCreatedTime: now,
    });

    // todo: send notification to toUser

    return {
      isAutoMatch: false,
      conversationId: null,
    };
  }

  async acceptFriendRequest(
    acceptFriendRequestParams: TAcceptFriendRequestParams
  ): Promise<TAcceptFriendRequestVo> {
    const { requestId } = acceptFriendRequestParams;

    const friendRequest = await this.friendRequestRepository.findFriendRequestById(requestId, {
      status: FriendRequestStatus.Pending,
    });

    if (!friendRequest) {
      throw new CustomHttpException(
        `Pending friend request ${requestId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const userId = this.clsService.get('user.id');
    const { friendRequestFromId: fromId, friendRequestToId: toId } = friendRequest;
    if (toId !== userId) {
      throw new CustomHttpException('Invalid friend request', HttpErrorCode.INVALID_CREDENTIALS, {
        currentUserId: userId,
        toId,
      });
    }

    const conversationId = await this.processCreateFriendShip({ fromId, toId });

    // todo: send notification to fromUser (requester)

    return { conversationId };
  }

  private async processCreateFriendShip(
    userIds: { fromId: string; toId: string },
    isMatchedBySystem?: boolean
  ) {
    const { fromId, toId } = userIds;

    const now = new Date();
    const conversationId = await executeTx(this.kyselyService.db, async (tx) => {
      const friendRequestPartialPayload: TUpdatableFriendRequest = {
        friendRequestStatus: FriendRequestStatus.Accepted,
        friendRequestMatchedBySystem: isMatchedBySystem,
        friendRequestResolvedTime: now,
      };

      await Promise.all([
        await this.friendRequestRepository.updateFriendRequestByUserIds(
          friendRequestPartialPayload,
          { fromId: fromId, toId: toId },
          { friendRequestStatus: FriendRequestStatus.Pending },
          tx
        ),
        await this.friendRequestRepository.updateFriendRequestByUserIds(
          friendRequestPartialPayload,
          { fromId: toId, toId: fromId },
          { friendRequestStatus: FriendRequestStatus.Pending },
          tx
        ),
      ]);

      await this.relationshipRepository.createRelationship(
        {
          relationshipId: generateRelationshipId(),
          relationshipUserIdA: fromId,
          relationshipUserIdB: toId,
          relationshipType: RelationshipType.Friend,
          relationshipCreatedTime: now,
        },
        tx
      );

      const existingConversation =
        await this.conversationRepository.findConversationByParticipantIds(
          [fromId, toId],
          { conversationType: ConversationType.Direct },
          tx
        );

      let conversationId = existingConversation?.conversationId;

      if (!existingConversation) {
        const conversation = await this.conversationRepository.createConversation(
          {
            conversationId: generateConversationId(),
            conversationType: ConversationType.Direct,
            conversationCreatedTime: now,
          },
          tx
        );

        conversationId = conversation.conversationId;
      }

      if (!conversationId) {
        throw new CustomHttpException(
          'Failed to create conversation',
          HttpErrorCode.INTERNAL_SERVER_ERROR
        );
      }

      const conversationParticipantPartialObj: Omit<
        TInsertableConversationParticipant,
        'conversationParticipantParticipantId'
      > & {
        conversationParticipantParticipantId?: string;
      } = {
        conversationParticipantConversationId: conversationId,
        conversationParticipantRole: ConversationParticipantRole.Member,
        conversationParticipantJoinedTime: now,
      };

      const conversationParticipantPartialPayload: TUpdatableConversationParticipant = {
        conversationParticipantClosedTime: null,
      };

      await Promise.all([
        await this.conversationParticipantRepository.upsertConversationParticipant(
          {
            ...conversationParticipantPartialObj,
            conversationParticipantId: generateConversationParticipantId(),
            conversationParticipantParticipantId: fromId,
          },
          conversationParticipantPartialPayload,
          tx
        ),
        await this.conversationParticipantRepository.upsertConversationParticipant(
          {
            ...conversationParticipantPartialObj,
            conversationParticipantId: generateConversationParticipantId(),
            conversationParticipantParticipantId: toId,
          },
          conversationParticipantPartialPayload,
          tx
        ),
      ]);

      return conversationId;
    });

    // todo: send notification to both users

    return conversationId;
  }

  async rejectFriendRequest(rejectFriendRequestParams: TRejectFriendRequestParams): Promise<void> {
    const { requestId } = rejectFriendRequestParams;

    const friendRequest = await this.friendRequestRepository.findFriendRequestById(requestId, {
      status: FriendRequestStatus.Pending,
    });

    if (!friendRequest) {
      throw new CustomHttpException(
        `Pending friend request ${requestId} does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const userId = this.clsService.get('user.id');
    const { friendRequestFromId: fromId, friendRequestToId: toId } = friendRequest;
    if (toId !== userId) {
      throw new CustomHttpException('Invalid friend request', HttpErrorCode.INVALID_CREDENTIALS, {
        currentUserId: userId,
        toId,
      });
    }

    const now = new Date();

    await this.friendRequestRepository.updateFriendRequestByUserIds(
      {
        friendRequestStatus: FriendRequestStatus.Reject,
        friendRequestResolvedTime: now,
      },
      { fromId, toId },
      { friendRequestStatus: FriendRequestStatus.Pending }
    );

    // todo: send notification to toUser
  }

  async getFriendRequests(
    getFriendRequestQueryParams: TGetFriendRequestQueryParams
  ): Promise<TGetFriendRequestVo> {
    const { status, type } = getFriendRequestQueryParams;
    const userId = this.clsService.get('user.id');

    const options: TGetFriendRequestsByUserIdOptions = {};

    if (status) {
      options.friendRequestStatus = status;
    }

    if (type) {
      if (type === GetFriendRequestsType.In) {
        options.friendRequestToId = userId;
      } else if (type === GetFriendRequestsType.Out) {
        options.friendRequestFromId = userId;
      }
    } else {
      options.friendRequestFromId = userId;
      options.friendRequestToId = userId;
    }

    const friendRequests = await this.friendRequestRepository.getFriendRequestsByUserId(
      userId,
      options
    );

    const formattedFriendRequests: TGetFriendRequest[] = friendRequests.map((friendRequest) => ({
      ...friendRequest,
      userAvatarUrl: getFullStorageUrl(friendRequest.userAvatarUrl),
      friendRequestStatus: friendRequest.friendRequestStatus as FriendRequestStatus,
      sendFriendRequestTime: friendRequest.friendRequestCreatedTime,
      friendedTime: friendRequest.friendRequestResolvedTime,
    }));

    return {
      count: formattedFriendRequests.length,
      friendRequests: formattedFriendRequests,
    };
  }
}
