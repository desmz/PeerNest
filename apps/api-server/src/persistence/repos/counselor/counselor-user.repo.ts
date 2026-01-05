import { Injectable } from '@nestjs/common';
import { TGetMyPerchersQueryParams } from '@peernest/contract';
import { generateCounselorUserId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableCounselorUser,
  TKyselyTransaction,
  TUpdatableCounselorUser,
} from '@peernest/db';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class CounselorUserRepository {
  private static repoName = 'COUNSELOR_USER_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createCounselorUser(counselorUserObj: TInsertableCounselorUser, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = counselorUserObj.counselorUserCreatedTime
        ? counselorUserObj.counselorUserCreatedTime
        : new Date();

      const counselorUser = await db
        .insertInto('counselorUser')
        .values({
          ...counselorUserObj,
          counselorUserId: counselorUserObj.counselorUserId
            ? counselorUserObj.counselorUserId
            : generateCounselorUserId(),
          counselorUserCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return counselorUser!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to create counselor-user`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, counselorUserObj }
      );
    }
  }

  async updateCounselorUserByIds(
    counselorUserPayload: TUpdatableCounselorUser,
    ids: { counselorId: string; userId: string },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { counselorId, userId } = ids;

      const now = counselorUserPayload.counselorUserUpdatedTime
        ? counselorUserPayload.counselorUserUpdatedTime
        : new Date();

      const counselorUser = await db
        .updateTable('counselorUser')
        .set({
          ...counselorUserPayload,
          counselorUserUpdatedTime: now,
        })
        .where('counselorUserCounselorId', '=', counselorId)
        .where('counselorUserUserId', '=', userId)
        .returningAll()
        .executeTakeFirst();

      return counselorUser!;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to update counselor-user by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }

  async findCounselorUserByIds(
    ids: { counselorId: string; userId: string },
    options?: { isReleased?: boolean },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { counselorId, userId } = ids;

      const { isReleased } = options || {};

      let query = db
        .selectFrom('counselorUser')
        .selectAll()
        .where('counselorUserCounselorId', '=', counselorId)
        .where('counselorUserUserId', '=', userId);

      if (!isReleased) {
        query = query.where('counselorUserReleasedTime', 'is', null);
      }

      const counselorUser = await query.executeTakeFirst();

      return counselorUser;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to find counselor-user by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
      );
    }
  }

  // special task
  //* Only find for pending role applications
  async findPerchersByCounselorId(
    counselorId: string,
    options?: TGetMyPerchersQueryParams,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { limit = 500, offset = 0 } = options || {};

      let query = db
        .with('base_counselor_user', (eb) =>
          eb
            .selectFrom('counselorUser')
            .where('counselorUserCounselorId', '=', counselorId)
            .where('counselorUserReleasedTime', 'is', null)
            .selectAll()
        )
        .selectFrom('base_counselor_user')
        .innerJoin('user', 'user.userId', 'base_counselor_user.counselorUserUserId')
        .innerJoin('role', 'role.roleId', 'user.userRoleId')
        .innerJoin('userInfo', 'userInfo.userInfoUserId', 'user.userId')
        .select((eb) => [
          'base_counselor_user.counselorUserId',
          'base_counselor_user.counselorUserCounselorId',
          'base_counselor_user.counselorUserNote',
          'base_counselor_user.counselorUserUpdatedTime',

          // user (percher)
          'user.userId',
          'user.userDisplayName',
          'user.userAvatarUrl',
          'userInfo.userInfoLookingFor',
          'role.roleName',
          jsonObjectFrom(
            eb
              .selectFrom('pronoun')
              .whereRef('pronoun.pronounId', '=', 'userInfo.userInfoPronounId')
              .select(['pronoun.pronounId', 'pronoun.pronounName'])
          ).as('userPronoun'),
          jsonObjectFrom(
            eb
              .selectFrom('university')
              .select([
                'university.universityId',
                'university.universityName',
                'university.universityCountry',
              ])
              .whereRef('university.universityId', '=', 'userInfo.userInfoUniversityId')
          ).as('userUniversity'),
          jsonObjectFrom(
            eb
              .selectFrom('domain')
              .select(['domain.domainId', 'domain.domainName'])
              .whereRef('domain.domainId', '=', 'userInfo.userInfoDomainId')
          ).as('userDomain'),
          jsonArrayFrom(
            eb
              .selectFrom('userInfoInterest')
              .innerJoin(
                'interest',
                'interest.interestId',
                'userInfoInterest.userInfoInterestInterestId'
              )
              .select([
                'interest.interestId',
                'interest.interestName',
                'userInfoInterest.userInfoInterestPosition as interestPosition',
              ])
              .whereRef('userInfo.userInfoId', '=', 'userInfoInterest.userInfoInterestUserInfoId')
              .orderBy('userInfoInterestPosition', 'asc')
          ).as('userInterest'),
          jsonArrayFrom(
            eb
              .selectFrom('userInfoPersonalGoal')
              .innerJoin(
                'personalGoal',
                'personalGoal.personalGoalId',
                'userInfoPersonalGoal.userInfoPersonalGoalPersonalGoalId'
              )
              .select([
                'personalGoal.personalGoalId',
                'personalGoal.personalGoalTitle',
                'personalGoal.personalGoalName',
                'personalGoal.personalGoalDescription',
                'userInfoPersonalGoal.userInfoPersonalGoalPosition as personalGoalPosition',
              ])
              .whereRef(
                'userInfo.userInfoId',
                '=',
                'userInfoPersonalGoal.userInfoPersonalGoalUserInfoId'
              )
              .orderBy('userInfoPersonalGoalPosition', 'asc')
          ).as('userPersonalGoal'),
        ]);

      query = query.orderBy((eb) => {
        const greaterTime = eb.fn('greatest', [
          'base_counselor_user.counselorUserCreatedTime',
          eb.fn.coalesce(
            'base_counselor_user.counselorUserUpdatedTime',
            'base_counselor_user.counselorUserCreatedTime'
          ),
        ]);
        return greaterTime;
      }, 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const counselorUsers = await query.execute();

      return counselorUsers;
    } catch (error) {
      throw new CustomHttpException(
        `[${CounselorUserRepository.repoName}] | Fail to find counselor-users by counselor id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, counselorId, options }
      );
    }
  }
}
