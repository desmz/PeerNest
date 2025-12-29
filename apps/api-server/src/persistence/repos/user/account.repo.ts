import { Injectable } from '@nestjs/common';
import { AccountType, generateAccountId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableAccount,
  TKyselyTransaction,
  TUpdatableAccount,
} from '@peernest/db';

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

      return account;
    } catch (error) {
      throw new CustomHttpException(
        `[${AccountRepository.repoName}] | Fail to create account`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, accountObj }
      );
    }
  }

  async upsertAccount(
    accountObj: TInsertableAccount,
    accountPayload: TUpdatableAccount,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const createdTimeNow = accountObj.accountCreatedTime
        ? accountObj.accountCreatedTime
        : new Date();

      const updatedTimeNow = accountObj.accountCreatedTime
        ? accountObj.accountCreatedTime
        : new Date();

      const account = await db
        .insertInto('account')
        .values({
          ...accountObj,
          accountId: accountObj.accountId ? accountObj.accountId : generateAccountId(),
          accountCreatedTime: createdTimeNow,
        })
        .onConflict((oc) =>
          oc
            .columns(['accountProvider', 'accountProviderUserId'])
            .doUpdateSet({ ...accountPayload, accountUpdatedTime: updatedTimeNow })
        )
        .returningAll()
        .executeTakeFirst();

      return account!;
    } catch (error) {
      throw new CustomHttpException(
        `[${AccountRepository.repoName}] | Fail to upsert account`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, accountObj, accountPayload }
      );
    }
  }

  async findAccountsByUserId(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const accounts = db
        .selectFrom('account')
        .selectAll()
        .where('accountUserId', '=', id)
        .where('accountDeletedTime', 'is', null)
        .execute();

      return accounts;
    } catch (error) {
      throw new CustomHttpException(
        `[${AccountRepository.repoName}] | Fail to find accounts by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  async softDeleteSocialAccountsByUserId(
    userId: string,
    deletedTime?: Date,
    tx?: TKyselyTransaction
  ): Promise<void> {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .updateTable('account')
        .set({
          accountDeletedTime: deletedTime || new Date(),
        })
        .where(({ and, eb }) =>
          and([eb('accountUserId', '=', userId), eb('accountType', '=', AccountType.Social)])
        )
        .execute();
    } catch (error) {
      throw new CustomHttpException(
        `[${AccountRepository.repoName}] | Fail to soft delete social accounts by user id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userId }
      );
    }
  }
}
