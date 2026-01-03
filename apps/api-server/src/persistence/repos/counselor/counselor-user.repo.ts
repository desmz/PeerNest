import { Injectable } from '@nestjs/common';
import { generateCounselorUserId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCounselorUser,
  TKyselyTransaction,
  TUpdatableCounselorUser,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CounselorUserRepository {
  private static repoName = 'COUNSELOR_USER_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createCounselorUser(counselorUserObj: TInsertableCounselorUser, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = counselorUserObj.counselorUserCreatedTime
        ? counselorUserObj.counselorUserCreatedTime
        : new Date();

      const counselorUser = await db
        .insertInto('counselorUser')
        .values({
          ...counselorUserObj,
          counselorUserId: counselorUserObj.counselorUserId
            ? counselorUserObj.counselorUserId
            : generateCounselorUserId(),
          counselorUserCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return counselorUser!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to create counselor-user`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, counselorUserObj }
      );
    }
  }

  async updateCounselorUserByIds(
    counselorUserPayload: TUpdatableCounselorUser,
    ids: { counselorId: string; userId: string },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { counselorId, userId } = ids;

      const now = counselorUserPayload.counselorUserUpdatedTime
        ? counselorUserPayload.counselorUserUpdatedTime
        : new Date();

      const counselorUser = await db
        .updateTable('counselorUser')
        .set({
          ...counselorUserPayload,
          counselorUserUpdatedTime: now,
        })
        .where('counselorUserCounselorId', '=', counselorId)
        .where('counselorUserUserId', '=', userId)
        .returningAll()
        .executeTakeFirst();

      return counselorUser!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to update counselor-user by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }

  async findCounselorUserByIds(
    ids: { counselorId: string; userId: string },
    options?: { isReleased?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { counselorId, userId } = ids;

      const { isReleased } = options || {};

      let query = db
        .selectFrom('counselorUser')
        .selectAll()
        .where('counselorUserCounselorId', '=', counselorId)
        .where('counselorUserUserId', '=', userId);

      if (!isReleased) {
        query = query.where('counselorUserReleasedTime', 'is', null);
      }

      const counselorUser = await query.executeTakeFirst();

      return counselorUser;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to find counselor-user by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
      );
    }
  }
}
