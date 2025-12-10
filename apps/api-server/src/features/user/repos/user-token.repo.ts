import { Injectable } from '@nestjs/common';
import { generateUserTokenId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUserToken,
  TKyselyTransaction,
  TUpdatableUserToken,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserTokenRepository {
  private static repoName = 'USER_TOKEN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUserToken(userTokenObj: TInsertableUserToken, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userTokenObj.userTokenCreatedTime
        ? userTokenObj.userTokenCreatedTime
        : new Date();

      const userToken = await db
        .insertInto('userToken')
        .values({
          ...userTokenObj,
          userTokenId: userTokenObj.userTokenId ? userTokenObj.userTokenId : generateUserTokenId(),
          userTokenCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return userToken!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserTokenRepository.repoName}] | Fail to create user token`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userTokenObj }
      );
    }
  }

  async updateUserTokenById(
    userTokenPayload: TUpdatableUserToken,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userToken = await db
        .updateTable('userToken')
        .set(userTokenPayload)
        .where('userTokenId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return userToken!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserTokenRepository.repoName}] | Fail to update user token by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userTokenPayload, id }
      );
    }
  }

  async findUserTokenByTokenHash(tokenHash: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const userToken = await db
        .selectFrom('userToken')
        .selectAll()
        .where('userTokenTokenHash', '=', tokenHash)
        .orderBy('userTokenCreatedTime', 'desc')
        .executeTakeFirst();

      return userToken;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserTokenRepository.repoName}] | Fail to find user token by token hash`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, tokenHash }
      );
    }
  }
}
