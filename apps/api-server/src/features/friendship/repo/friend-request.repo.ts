import { Injectable } from '@nestjs/common';
import { FriendRequestStatus, generateFriendRequestId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableFriendRequest,
  TKyselyTransaction,
  TUpdatableFriendRequest,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

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

  async findFriendRequestByUserIds(
    userIds: {
      fromId: string;
      toId: string;
    },
    options?: { status?: FriendRequestStatus },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { fromId, toId } = userIds;
      const { status } = options || {};

      let query = db
        .selectFrom('friendRequest')
        .selectAll()
        .where('friendRequestFromId', '=', fromId)
        .where('friendRequestToId', '=', toId);

      if (status) {
        query = query.where('friendRequestStatus', '=', status);
      }

      const friendRequest = await query.executeTakeFirst();

      return friendRequest;
    } catch (error) {
      throw new CustomHttpException(
        `[${FriendRequestRepository.repoName}] | Fail to find friend request by userIds`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userIds }
      );
    }
  }
}
