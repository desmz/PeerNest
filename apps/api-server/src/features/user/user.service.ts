import { Injectable } from '@nestjs/common';
import {
  TFindUsersQueryParams,
  TFindUsersVo,
  TGetUserProfileLatestFriendRequest,
  TGetUserProfileParams,
  TGetUserProfileRelationship,
  TGetUserProfileVo,
} from '@peernest/contract';
import {
  ConversationType,
  FriendRequestStatus,
  FriendRequestType,
  HttpErrorCode,
  RelationshipType,
} from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { getFullStorageUrl } from '@/features/attachment/utils';
import { ConversationRepository } from '@/persistence/repos/conversation/conversation.repo';
import { FriendRequestRepository } from '@/persistence/repos/friendship/friend-request.repo';
import { RelationshipRepository } from '@/persistence/repos/friendship/relationship.repo';
import { UserInfoRepository } from '@/persistence/repos/user/user-info.repo';
import { UserRepository } from '@/persistence/repos/user/user.repo';
import { IClsStore } from '@/types/cls';

@Injectable()
export class UserService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,

    private readonly conversationRepository: ConversationRepository,
    private readonly friendRequestRepository: FriendRequestRepository,
    private readonly relationshipRepository: RelationshipRepository,
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository
  ) {}

  async findUsers(findUsersQueryParams: TFindUsersQueryParams): Promise<TFindUsersVo> {
    const userId = this.clsService.get('user.id');
    const users = await this.userRepository.findUsers({
      ...findUsersQueryParams,
      excludedUserIds: [userId],
    });

    return {
      count: users.length,
      users: users.map((user) => ({
        ...user,
        userAvatarUrl: getFullStorageUrl(user.userAvatarUrl),
      })),
    };
  }

  async getUserProfile(getUserProfileParams: TGetUserProfileParams): Promise<TGetUserProfileVo> {
    const { userId } = getUserProfileParams;
    const currentUserId = this.clsService.get('user.id');

    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new CustomHttpException(`User ${userId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    if (user.userDeletedTime) {
      throw new CustomHttpException(
        `User ${userId} is disabled or deleted`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    // todo: add ban check

    const userInfo = await this.userInfoRepository.findUserInfoByUserId(userId);

    if (!userInfo) {
      throw new CustomHttpException('User info is not found', HttpErrorCode.NOT_FOUND);
    }

    const [userInfoAgg, relationships, friendRequest] = await Promise.all([
      await this.userInfoRepository.findUserInfoAggByUserInfoId(userInfo.userInfoId),
      await this.relationshipRepository.findRelationshipsByUserIds({
        userIdA: currentUserId,
        userIdB: userId,
      }),
      await this.friendRequestRepository.findFriendRequestByUserIds(
        { fromId: currentUserId, toId: userId },
        { isBothDirections: true }
      ),
    ]);

    const formattedRelationships: TGetUserProfileRelationship[] = await Promise.all(
      relationships.map(async (relationship) => {
        const { relationshipType, relationshipCreatedTime } = relationship;

        const formattedRelationship: TGetUserProfileRelationship = {
          relationshipType: relationshipType as RelationshipType,
        };

        if (relationshipType === RelationshipType.Friend) {
          formattedRelationship.friendedTime = relationshipCreatedTime;

          const conversation = await this.conversationRepository.findConversationByParticipantIds(
            [currentUserId, userId],
            { conversationType: ConversationType.Direct }
          );

          if (!conversation) {
            throw new CustomHttpException(
              `Conversation between you and ${user.userDisplayName} does not exist`,
              HttpErrorCode.NOT_FOUND
            );
          }

          formattedRelationship.conversationId = conversation.conversationId;
        }

        return formattedRelationship;
      })
    );

    let formattedFriendRequest: TGetUserProfileLatestFriendRequest | null = null;

    if (friendRequest) {
      const { friendRequestStatus, friendRequestFromId } = friendRequest;

      formattedFriendRequest = {
        friendRequestStatus: friendRequestStatus as FriendRequestStatus,
        friendRequestType: null,
      };

      if (friendRequestStatus === FriendRequestStatus.Pending) {
        formattedFriendRequest.friendRequestType =
          currentUserId === friendRequestFromId ? FriendRequestType.Out : FriendRequestType.In;
      }
    }

    return {
      ...userInfoAgg!,
      userId,
      userDisplayName: user.userDisplayName,
      userAvatarUrl: getFullStorageUrl(user.userAvatarUrl),
      roleName: user.roleName,
      relationships: formattedRelationships,
      latestFriendRequest: formattedFriendRequest,
    };
  }
}
