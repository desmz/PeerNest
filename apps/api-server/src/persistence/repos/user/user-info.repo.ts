import { Injectable } from '@nestjs/common';
import { generateUserInfoId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserInfo,
  TKyselyTransaction,
  TUpdatableUserInfo,
} from '@peernest/db';
import { UserInfo } from '@peernest/db/types/db';

import { CustomHttpException } from '@/custom.exception';

import {
  withDomain,
  withInterests,
  withPersonalGoals,
  withPronoun,
  withUniversity,
} from './selects.util';

export type TUpdateUserInfoPayload = Pick<
  UserInfo,
  | 'userInfoPronounId'
  | 'userInfoUniversityId'
  | 'userInfoDomainId'
  | 'userInfoBio'
  | 'userInfoLookingFor'
> & {
  interestIds?: string[];
  personalGoalIds?: string[];
};

@Injectable()
export class UserInfoRepository {
  private static repoName = 'USER_INFO_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserInfo(userInfoObj: TInsertableUserInfo, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userInfoObj.userInfoCreatedTime ? userInfoObj.userInfoCreatedTime : new Date();

      const userInfo = await db
        .insertInto('userInfo')
        .values({
          ...userInfoObj,
          userInfoId: userInfoObj.userInfoId ? userInfoObj.userInfoId : generateUserInfoId(),
          userInfoCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return userInfo!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoRepository.repoName}] | Fail to create user info`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userInfoObj }
      );
    }
  }

  async updateUserInfoById(
    userInfoPayload: TUpdatableUserInfo,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userInfoPayload.userInfoUpdatedTime
        ? userInfoPayload.userInfoUpdatedTime
        : new Date();

      const userInfo = await db
        .updateTable('userInfo')
        .set({
          ...userInfoPayload,
          userInfoUpdatedTime: now,
        })
        .where('userInfoId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return userInfo!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoRepository.repoName}] | Fail to update user info by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userInfoPayload }
      );
    }
  }

  async findUserInfoByUserId(
    userId: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('userInfo').selectAll().where('userInfoUserId', '=', userId);

      if (!options?.includedDeleted) {
        query = query.where('userInfoDeletedTime', 'is', null);
      }

      const user = await query.executeTakeFirst();

      return user;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoRepository.repoName}] | Fail to find user info by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId, options }
      );
    }
  }

  async findUserInfoAggByUserInfoId(userInfoId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userInfoAggs = await db
        .selectFrom('userInfo')
        .select(['userInfo.userInfoBio', 'userInfo.userInfoLookingFor'])
        .select((eb) => withPronoun(eb))
        .select((eb) => withUniversity(eb))
        .select((eb) => withDomain(eb))
        .select((eb) => withInterests(eb))
        .select((eb) => withPersonalGoals(eb))
        .where('userInfoId', '=', userInfoId)
        .executeTakeFirst();

      return userInfoAggs;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserInfoRepository.repoName}] | Fail to find user info agg by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userInfoId }
      );
    }
  }
}
