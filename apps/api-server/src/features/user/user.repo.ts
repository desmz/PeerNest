import { Injectable } from '@nestjs/common';
import { generateUserId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUser,
  TKyselyTransaction,
  TSelectableUser,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

console.log(new Date());

@Injectable()
export class UserRepository {
  private static repoName = 'USER_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createUser(userObj: TInsertableUser, tx?: TKyselyTransaction): Promise<TSelectableUser> {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userObj.createdTime ? userObj.createdTime : new Date();

      const user = await db
        .insertInto('user')
        .values({
          ...userObj,
          id: userObj.id ? userObj.id : generateUserId(),
          createdTime: now,
          updatedTime: now,
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

  async findUserById(
    id: string,
    options?: { includedDeleted?: boolean },
    tx?: TKyselyTransaction
  ): Promise<TSelectableUser | undefined> {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('user').selectAll().where('id', '=', id);

      if (!options?.includedDeleted) {
        query = query.where('deletedTime', 'is', null);
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
  ): Promise<TSelectableUser | undefined> {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('user').selectAll().where('email', '=', email);

      if (!options?.includedDeleted) {
        query = query.where('deletedTime', 'is', null);
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
