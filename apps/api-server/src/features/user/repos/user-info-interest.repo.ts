import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserInfoInterest,
  TKyselyTransaction,
  TUpdatableUserInfoInterest,
} from '@peernest/db';
import { Expression, SqlBool } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserInfoInterestRepository {
  private static repoName = 'USER_INFO_INTEREST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async upsertUserInfoInterests(
    userInfoInterestObjs: TInsertableUserInfoInterest[],
    userInfoInterestPayloads: TUpdatableUserInfoInterest[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const firstPayloadUpdatedTime = userInfoInterestPayloads[0].userInfoInterestUpdatedTime;
      const updatedTimeNow = firstPayloadUpdatedTime ? firstPayloadUpdatedTime : new Date();

      const userInfoInterests = await db
        .insertInto('userInfoInterest')
        .values(userInfoInterestObjs)
        .onConflict((oc) =>
          oc.columns(['userInfoInterestUserInfoId', 'userInfoInterestInterestId']).doUpdateSet({
            userInfoInterestUpdatedTime: updatedTimeNow,
          })
        )
        .execute();
      return userInfoInterests!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoInterestRepository.repoName}] | Fail to upsert user info-interests`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async deleteUserInfoInterests(
    userInfoInterestKeys: {
      userInfoInterestUserInfoId: string;
      userInfoInterestInterestIds: string[];
    },
    options?: { isExcludeInterestIds?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const { userInfoInterestUserInfoId, userInfoInterestInterestIds } = userInfoInterestKeys;
      const { isExcludeInterestIds } = options || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .deleteFrom('userInfoInterest')
        .where(({ and, eb }) => {
          const ors: Expression<SqlBool>[] = [];

          ors.push(eb('userInfoInterestUserInfoId', '=', userInfoInterestUserInfoId));

          if (isExcludeInterestIds) {
            ors.push(eb('userInfoInterestInterestId', 'not in', userInfoInterestInterestIds));
          } else {
            ors.push(eb('userInfoInterestInterestId', 'in', userInfoInterestInterestIds));
          }

          return and(ors);
        })
        .execute();
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoInterestRepository.repoName}] | Fail to delete user info-interests`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPositionByUserInfoId(userInfoId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userInfoInterest = await db
        .selectFrom('userInfoInterest')
        .select((eb) => eb.fn.max('userInfoInterestPosition').as('userInfoInterestMaxPosition'))
        .where('userInfoInterestUserInfoId', '=', userInfoId)
        .executeTakeFirst();

      let maxPos = -1;
      if (userInfoInterest && userInfoInterest.userInfoInterestMaxPosition) {
        maxPos = parseInt(userInfoInterest.userInfoInterestMaxPosition);
      }

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoInterestRepository.repoName}] | Fail to find maximum position of user info-interests by user info id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
