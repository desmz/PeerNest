import { Injectable } from '@nestjs/common';
import { generateInterestId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableInterest,
  TKyselyTransaction,
  TSelectableInterest,
  TUpdatableInterest,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class InterestRepository {
  private static repoName = 'INTEREST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createInterest(interestObj: TInsertableInterest, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = interestObj.interestCreatedTime ? interestObj.interestCreatedTime : new Date();

      const interest = await db
        .insertInto('interest')
        .values({
          ...interestObj,
          interestId: interestObj.interestId ? interestObj.interestId : generateInterestId(),
          interestCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return interest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to create interest`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, interestObj }
      );
    }
  }

  async updateInterestById(
    interestPayload: TUpdatableInterest,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = interestPayload.interestUpdatedTime
        ? interestPayload.interestUpdatedTime
        : new Date();

      const interest = await db
        .updateTable('interest')
        .set({
          ...interestPayload,
          interestUpdatedTime: now,
        })
        .where('interestId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return interest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to update interest by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, interestPayload, id }
      );
    }
  }

  async findInterests(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectableInterest | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted, orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('interest').selectAll();

      if (!includedDeleted) {
        query = query.where('interestDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const interests = await query.execute();

      return interests;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to find interests`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  async findInterestById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const interest = await db
        .selectFrom('interest')
        .where('interestId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return interest;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to find interest by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async findInterestByName(name: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const interest = await db
        .selectFrom('interest')
        .where('interestName', '=', name)
        .selectAll()
        .executeTakeFirst();

      return interest;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to find interest by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPosition(tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const interest = await db
        .selectFrom('interest')
        .select((eb) =>
          eb.cast<number>(eb.fn.max('interestPosition'), 'bigint').as('interestMaxPosition')
        )
        .executeTakeFirst();

      const maxPos = interest?.interestMaxPosition ? interest.interestMaxPosition : -1;

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${InterestRepository.repoName}] | Fail to find max position by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
