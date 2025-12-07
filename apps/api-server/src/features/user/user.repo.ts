import { Injectable } from '@nestjs/common';
import { generateUserId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableUser, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class UserRepository {
  private static repoName = 'USER_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUser(userObj: TInsertableUser, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userObj.userCreatedTime ? userObj.userCreatedTime : new Date();

      const user = await db
        .insertInto('user')
        .values({
          ...userObj,
          userId: userObj.userId ? userObj.userId : generateUserId(),
          userCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return user!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserRepository.repoName}] | Fail to create user`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userObj }
      );
    }
  }

  async findUserById(id: string, options?: { includedDeleted?: boolean }, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('user')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .selectAll(['user', 'role'])
        .where('userId', '=', id);

      if (!options?.includedDeleted) {
        query = query.where('userDeletedTime', 'is', null);
      }

      const user = await query.executeTakeFirst();

      return user;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserRepository.repoName}] | Fail to find user by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  async findUserByEmail(
    email: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db
        .selectFrom('user')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .selectAll(['user', 'role'])
        .where('userEmail', '=', email);

      if (!options?.includedDeleted) {
        query = query.where('userDeletedTime', 'is', null);
      }

      const user = await query.executeTakeFirst();

      return user;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserRepository.repoName}] | Fail to find user by email`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, email }
      );
    }
  }
}
