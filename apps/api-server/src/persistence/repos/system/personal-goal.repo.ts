import { Injectable } from '@nestjs/common';
import { generatePersonalGoalId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertablePersonalGoal,
  TKyselyTransaction,
  TSelectablePersonalGoal,
  TUpdatablePersonalGoal,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class PersonalGoalRepository {
  private static repoName = 'PERSONAL_GOAL_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createPersonalGoal(personalGoalObj: TInsertablePersonalGoal, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = personalGoalObj.personalGoalCreatedTime
        ? personalGoalObj.personalGoalCreatedTime
        : new Date();

      const personalGoal = await db
        .insertInto('personalGoal')
        .values({
          ...personalGoalObj,
          personalGoalId: personalGoalObj.personalGoalId
            ? personalGoalObj.personalGoalId
            : generatePersonalGoalId(),
          personalGoalCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return personalGoal!;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to create personal goal`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, personalGoalObj }
      );
    }
  }

  async updatePersonalGoalById(
    personalGoalPayload: TUpdatablePersonalGoal,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = personalGoalPayload.personalGoalUpdatedTime
        ? personalGoalPayload.personalGoalUpdatedTime
        : new Date();

      const personalGoal = await db
        .updateTable('personalGoal')
        .set({
          ...personalGoalPayload,
          personalGoalUpdatedTime: now,
        })
        .where('personalGoalId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return personalGoal!;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to update personal goal by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, personalGoalPayload, id }
      );
    }
  }

  async findPersonalGoalById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const personalGoal = await db
        .selectFrom('personalGoal')
        .where('personalGoalId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return personalGoal;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to find personalGoal by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async findPersonalGoalByTitle(title: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const personalGoal = await db
        .selectFrom('personalGoal')
        .where('personalGoalTitle', '=', title)
        .selectAll()
        .executeTakeFirst();

      return personalGoal;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to find personal goal by title`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }

  async findPersonalGoals(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectablePersonalGoal | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted, orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('personalGoal').selectAll();

      if (!includedDeleted) {
        query = query.where('personalGoalDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const personalGoals = await query.execute();

      return personalGoals;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to find personal goals`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }

  //* -1 indicates not found (zero row)
  async findMaxPosition(tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const personalGoal = await db
        .selectFrom('personalGoal')
        .select((eb) =>
          eb.cast<number>(eb.fn.max('personalGoalPosition'), 'bigint').as('personalGoalMaxPosition')
        )
        .executeTakeFirst();

      const maxPos = personalGoal?.personalGoalMaxPosition
        ? personalGoal.personalGoalMaxPosition
        : -1;

      return maxPos;
    } catch (error) {
      throw new CustomHttpException(
        `[${PersonalGoalRepository.repoName}] | Fail to find max position by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error }
      );
    }
  }
}
