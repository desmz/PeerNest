import { Injectable } from '@nestjs/common';
import { FriendRequestStatus, generateFriendRequestId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableFriendRequest,
  TKyselyTransaction,
  TUpdatableFriendRequest,
} from '@peernest/db';
import { Expression, SqlBool } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

import { TGetFriendRequestsByUserIdOptions } from '../../../features/friendship/types';

@Injectable()
export class FriendRequestRepository {
  private static repoName = 'RELATIONSHIP_REPO';

  constructor(private readonly kyselyService: KyselyService) {}

  async createFriendRequest(friendRequestObj: TInsertableFriendRequest, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = friendRequestObj.friendRequestCreatedTime
        ? friendRequestObj.friendRequestCreatedTime
        : new Date();

      const friendRequest = await db
        .insertInto('friendRequest')
        .values({
          ...friendRequestObj,
          friendRequestId: friendRequestObj.friendRequestId
            ? friendRequestObj.friendRequestId
            : generateFriendRequestId(),
          friendRequestCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return friendRequest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to create friend request`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, friendRequestObj }
      );
    }
  }

  async updateFriendRequestByUserIds(
    friendRequestPayload: TUpdatableFriendRequest,
    userIds: {
      fromId: string;
      toId: string;
    },
    options?: {
      friendRequestStatus?: FriendRequestStatus;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { fromId, toId } = userIds;
      const { friendRequestStatus } = options || {};

      const now = friendRequestPayload.friendRequestCreatedTime
        ? friendRequestPayload.friendRequestCreatedTime
        : new Date();

      let query = db
        .updateTable('friendRequest')
        .set({
          ...friendRequestPayload,
          friendRequestResolvedTime: now,
        })
        .where('friendRequestFromId', '=', fromId)
        .where('friendRequestToId', '=', toId);

      if (friendRequestStatus) {
        query = query.where('friendRequestStatus', '=', friendRequestStatus);
      }

      const friendRequest = await query.returningAll().executeTakeFirst();

      return friendRequest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to update friend request`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, friendRequestPayload }
      );
    }
  }

  async findFriendRequestById(
    id: string,
    options?: { status?: FriendRequestStatus },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { status } = options || {};

      let query = db.selectFrom('friendRequest').selectAll().where('friendRequestId', '=', id);

      if (status) {
        query = query.where('friendRequestStatus', '=', status);
      }

      const friendRequest = await query.executeTakeFirst();

      return friendRequest;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to find friend request by userIds`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  //* return the latest friend requests by user ids
  async findFriendRequestByUserIds(
    userIds: {
      fromId: string;
      toId: string;
    },
    options?: { status?: FriendRequestStatus; isBothDirections?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { fromId, toId } = userIds;
      const { status, isBothDirections } = options || {};

      let query = db
        .selectFrom('friendRequest')
        .selectAll()
        .where(({ and, or, eb }) => {
          const ors: Expression<SqlBool>[] = [];

          ors.push(
            and([eb('friendRequestFromId', '=', fromId), eb('friendRequestToId', '=', toId)])
          );

          if (isBothDirections) {
            ors.push(
              and([eb('friendRequestFromId', '=', toId), eb('friendRequestToId', '=', fromId)])
            );
          }

          return or(ors);
        });

      if (status) {
        query = query.where('friendRequestStatus', '=', status);
      }

      query = query.orderBy('friendRequestCreatedTime', 'desc').limit(1);

      const friendRequest = await query.executeTakeFirst();

      return friendRequest;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to find friend request by userIds`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userIds, options }
      );
    }
  }

  // Special Case
  async getFriendRequestsByUserId(
    userId: string,
    options?: TGetFriendRequestsByUserIdOptions,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { friendRequestFromId, friendRequestToId, friendRequestStatus } = options || {};

      let query = db
        .selectFrom('friendRequest')
        .innerJoin('user', (join) =>
          join.on('user.userId', '=', (eb) =>
            eb
              .case()
              .when('friendRequest.friendRequestFromId', '=', userId)
              .then(eb.ref('friendRequest.friendRequestToId'))
              .else(eb.ref('friendRequest.friendRequestFromId'))
              .end()
          )
        )
        .select([
          'user.userId',
          'user.userDisplayName',
          'user.userAvatarUrl',
          'user.userLastSignedTime',
          'friendRequest.friendRequestStatus',
          'friendRequest.friendRequestCreatedTime',
          'friendRequest.friendRequestResolvedTime',
        ]);

      query = query.where(({ or, eb }) => {
        const ors: Expression<SqlBool>[] = [];

        if (friendRequestFromId) {
          ors.push(eb('friendRequest.friendRequestFromId', '=', friendRequestFromId));
        }

        if (friendRequestToId) {
          ors.push(eb('friendRequest.friendRequestToId', '=', friendRequestToId));
        }

        return or(ors);
      });

      if (friendRequestStatus) {
        query = query.where('friendRequest.friendRequestStatus', '=', friendRequestStatus);
      }

      query = query.orderBy('friendRequest.friendRequestCreatedTime', 'desc');

      const friendRequests = await query.execute();

      return friendRequests;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to get friend requests by userId`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }
}
