import { Injectable } from '@nestjs/common';
import { generateUserInfoId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableUserInfo, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

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
}
