import { Injectable } from '@nestjs/common';
import { generateAccountId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableAccount, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class AccountRepository {
  private static repoName = 'ACCOUNT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createAccount(accountObj: TInsertableAccount, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = accountObj.accountCreatedTime ? accountObj.accountCreatedTime : new Date();

      const account = await db
        .insertInto('account')
        .values({
          ...accountObj,
          accountId: accountObj.accountId ? accountObj.accountId : generateAccountId(),
          accountCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return account!;
    } catch (error) {
      throw new CustomHttpException(
        `[${AccountRepository.repoName}] | Fail to create account`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, accountObj }
      );
    }
  }

  // async findAccountById(
  //   id: string,
  //   options?: { includedDeleted?: boolean },
  //   tx?: TKyselyTransaction
  // ) {
  //   try {
  //     const db = dbOrTx(this.kyselyService.db, tx);

  //     let query = db
  //       .selectFrom('user')
  //       .innerJoin('role', 'role.roleId', 'user.userRoleId')
  //       .selectAll(['user', 'role'])
  //       .where('userId', '=', id);

  //     if (!options?.includedDeleted) {
  //       query = query.where('userDeletedTime', 'is', null);
  //     }

  //     const user = await query.executeTakeFirst();

  //     return user;
  //   } catch (error) {
  //     throw new CustomHttpException(
  //       `[${AccountRepository.repoName}] | Fail to find user by id`,
  //       HttpErrorCode.INTERNAL_SERVER_ERROR,
  //       { error, id }
  //     );
  //   }
  // }
}
