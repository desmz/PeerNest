import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserInfoPersonalGoal,
  TKyselyTransaction,
  TUpdatableUserInfoPersonalGoal,
} from '@peernest/db';
import { Expression, SqlBool } from 'kysely';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserInfoPersonalGoalRepository {
  private static repoName = 'USER_INFO_PERSONAL_GOAL_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async upsertUserInfoPersonalGoals(
    userInfoPersonalGoalObjs: TInsertableUserInfoPersonalGoal[],
    userInfoPersonalGoalPayloads: TUpdatableUserInfoPersonalGoal[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const firstPayloadUpdatedTime =
        userInfoPersonalGoalPayloads[0].userInfoPersonalGoalUpdatedTime;
      const updatedTimeNow = firstPayloadUpdatedTime ? firstPayloadUpdatedTime : new Date();

      const userInfoPersonalGoals = await db
        .insertInto('userInfoPersonalGoal')
        .values(userInfoPersonalGoalObjs)
        .onConflict((oc) =>
          oc
            .columns(['userInfoPersonalGoalUserInfoId', 'userInfoPersonalGoalPersonalGoalId'])
            .doUpdateSet({
              userInfoPersonalGoalUpdatedTime: updatedTimeNow,
            })
        )
        .execute();
      return userInfoPersonalGoals!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoPersonalGoalRepository.repoName}] | Fail to upsert user info-personal goal`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async deleteUserInfoPersonalGoals(
    userInfoPersonalGoalKeys: {
      userInfoPersonalGoalUserInfoId: string;
      userInfoPersonalGoalPersonalGoalIds: string[];
    },
    options?: { isExcludePersonalGoalIds?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const { userInfoPersonalGoalUserInfoId, userInfoPersonalGoalPersonalGoalIds } =
        userInfoPersonalGoalKeys;
      const { isExcludePersonalGoalIds } = options || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .deleteFrom('userInfoPersonalGoal')
        .where(({ and, eb }) => {
          const ors: Expression<SqlBool>[] = [];

          ors.push(eb('userInfoPersonalGoalUserInfoId', '=', userInfoPersonalGoalUserInfoId));

          if (isExcludePersonalGoalIds) {
            ors.push(
              eb(
                'userInfoPersonalGoalPersonalGoalId',
                'not in',
                userInfoPersonalGoalPersonalGoalIds
              )
            );
          } else {
            ors.push(
              eb('userInfoPersonalGoalPersonalGoalId', 'in', userInfoPersonalGoalPersonalGoalIds)
            );
          }

          return and(ors);
        })
        .execute();
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoPersonalGoalRepository.repoName}] | Fail to delete user info-personal goals`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPositionByUserInfoId(userInfoId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userInfoPersonalGoal = await db
        .selectFrom('userInfoPersonalGoal')
        .select((eb) =>
          eb.fn.max('userInfoPersonalGoalPosition').as('userInfoPersonalGoalMaxPosition')
        )
        .where('userInfoPersonalGoalUserInfoId', '=', userInfoId)
        .executeTakeFirst();

      let maxPos = -1;
      if (userInfoPersonalGoal && userInfoPersonalGoal.userInfoPersonalGoalMaxPosition) {
        maxPos = parseInt(userInfoPersonalGoal.userInfoPersonalGoalMaxPosition);
      }

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoPersonalGoalRepository.repoName}] | Fail to find maximum position of user info-interests by user info id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
