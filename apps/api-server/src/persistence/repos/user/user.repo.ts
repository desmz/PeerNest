import { Injectable } from '@nestjs/common';
import { TFindUsersQueryParams } from '@peernest/contract';
import { generateUserId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableUser,
  TKyselyTransaction,
  TUpdatableUser,
} from '@peernest/db';
import { Expression, sql, SqlBool } from 'kysely';
import tsquery from 'pg-tsquery';

import { CustomHttpException } from '@/custom.exception';

import {
  withDomain,
  withInterests,
  withPersonalGoals,
  withPronoun,
  withUniversity,
} from './selects.util';

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

  async updateUserById(userPayload: TUpdatableUser, id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = userPayload.userUpdatedTime ? userPayload.userUpdatedTime : new Date();

      const user = await db
        .updateTable('user')
        .set({
          ...userPayload,
          userUpdatedTime: now,
        })
        .where('userId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return user!;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserRepository.repoName}] | Fail to update user by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, userPayload, id }
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
        { error, id, options }
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
        { error, email, options }
      );
    }
  }

  async findUsers(
    options?: TFindUsersQueryParams & { includedDeleted?: boolean; excludedUserIds?: string[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const {
        q = '',
        interestIds,
        goalIds,
        limit,
        offset,
        includedDeleted,
        excludedUserIds,
      } = options || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      const displayNameQuery = q ? tsquery()(q.trim() + '*') : null;

      let query = db
        .selectFrom('userInfo')
        .innerJoin('user', 'user.userId', 'userInfo.userInfoUserId')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .select([
          'user.userId',
          'user.userDisplayName',
          'user.userAvatarUrl',
          'userInfo.userInfoLookingFor',
          'role.roleName',
        ])
        .select((eb) => withPronoun(eb))
        .select((eb) => withUniversity(eb))
        .select((eb) => withDomain(eb))
        .select((eb) => withInterests(eb))
        .select((eb) => withPersonalGoals(eb))
        .$if(Boolean(displayNameQuery), (eb) =>
          eb.select(
            sql<number>`
              ts_rank(
                user_display_name_tsv,
                to_tsquery('english', f_unaccent(${displayNameQuery}))
              )
            `.as('rank')
          )
        )
        .$if(Boolean(displayNameQuery), (eb) =>
          eb.select(
            sql<string>`
              ts_headline(
                'english',
                user_display_name,
                to_tsquery(
                  'english',
                  f_unaccent(${displayNameQuery})
                ),
                'StartSel=<b>, StopSel=</b>, MinWords=1, MaxWords=2, MaxFragments=1'
              )
          `.as('highlight')
          )
        );

      if (!includedDeleted) {
        query = query.where('user.userDeletedTime', 'is', null);
      }

      if (excludedUserIds && excludedUserIds.length > 0) {
        query = query.where('user.userId', 'not in', excludedUserIds);
      }

      if (displayNameQuery) {
        query = query.where(
          'user.userDisplayNameTsv',
          '@@',
          sql<string>`to_tsquery('english', f_unaccent(${displayNameQuery}))`
        );
      }

      query = query.where(({ or, exists, eb }) => {
        const ors: Expression<SqlBool>[] = [];

        if (interestIds && interestIds.length > 0) {
          ors.push(
            exists(
              eb
                .selectFrom('userInfoInterest')
                .select('userInfoInterest.userInfoInterestId')
                .whereRef('userInfo.userInfoId', '=', 'userInfoInterest.userInfoInterestUserInfoId')
                .where('userInfoInterest.userInfoInterestInterestId', 'in', interestIds)
            )
          );
        }

        if (goalIds && goalIds.length > 0) {
          ors.push(
            exists(
              eb
                .selectFrom('userInfoPersonalGoal')
                .select('userInfoPersonalGoal.userInfoPersonalGoalPersonalGoalId')
                .whereRef(
                  'userInfo.userInfoId',
                  '=',
                  'userInfoPersonalGoal.userInfoPersonalGoalUserInfoId'
                )
                .where('userInfoPersonalGoal.userInfoPersonalGoalPersonalGoalId', 'in', goalIds)
            )
          );
        }

        return ors.length > 0 ? or(ors) : sql`true`;
      });

      if (displayNameQuery) {
        query = query.orderBy('rank', 'desc');
      } else {
        query = query.orderBy('user.userLastSignedTime', 'desc');
      }

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const users = await query.execute();

      return users;
    } catch (error) {
      throw new CustomHttpException(
        `[${UserRepository.repoName}] | Fail to find users `,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
