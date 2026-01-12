import { Injectable } from '@nestjs/common';
import { TFindBanUsersQueryParams } from '@peernest/contract';
import {
  BanRequestStatus,
  FindBanUsersStatus,
  generateBanActionId,
  HttpErrorCode,
} from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableBanAction,
  TKyselyTransaction,
  TUpdatableBanAction,
} from '@peernest/db';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class BanActionRepository {
  private static repoName = 'BAN_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createBanAction(banActionObj: TInsertableBanAction, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = banActionObj.banActionCreatedTime
        ? banActionObj.banActionCreatedTime
        : new Date();

      const banAction = await db
        .insertInto('banAction')
        .values({
          ...banActionObj,
          banActionId: banActionObj.banActionId ? banActionObj.banActionId : generateBanActionId(),
          banActionCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return banAction!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to create ban action`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banActionObj }
      );
    }
  }

  async updateBanActionById(
    banActionPayload: TUpdatableBanAction,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = banActionPayload.banActionUpdatedTime
        ? banActionPayload.banActionUpdatedTime
        : new Date();

      const banAction = await db
        .updateTable('banAction')
        .set({
          ...banActionPayload,
          banActionUpdatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return banAction!;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to update ban action by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, banActionPayload, id }
      );
    }
  }

  async validateIfUserIsBanned(bannedUserId: string, banEndTime: Date, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banAction = await db
        .selectFrom('banAction')
        .where('banActionBannedUserId', '=', bannedUserId)
        .where((eb) =>
          eb.or([
            eb('banActionBanEndTime', 'is', null),
            eb('banActionBanEndTime', '>=', banEndTime),
          ])
        )
        .selectAll()
        .executeTakeFirst();

      return banAction ? true : false;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to validate if user is banned`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, bannedUserId, banEndTime }
      );
    }
  }

  async findBanActionById(id: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const banAction = await db
        .selectFrom('banAction')
        .where('banActionId', '=', id)
        .selectAll()
        .executeTakeFirst();

      return banAction;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to find ban action by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  // special case
  async findBanUsers(
    options: TFindBanUsersQueryParams & { banEndTime: Date },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { limit = 500, offset = 0, status, banEndTime } = options || {};

      let query = db
        .with('base_ban', (eb) =>
          eb
            .selectFrom('banRequest')
            .select((eb) => [
              'banRequestId as banId',
              eb.val<string>(FindBanUsersStatus.Review).as('status'),
              'banRequestBannedUserId as bannedUserId',
              'banRequestCreatedTime as banCreatedTime',
            ])
            .where('banRequestStatus', '=', BanRequestStatus.Pending)
            .unionAll(
              eb
                .selectFrom('banAction')
                .select((eb) => [
                  'banActionId as banId',
                  eb.val<string>(FindBanUsersStatus.Banned).as('status'),
                  'banActionBannedUserId as bannedUserId',
                  'banActionBanStartTime as banCreatedTime',
                ])
                .where((eb) =>
                  eb.or([
                    eb('banActionBanEndTime', 'is', null),
                    eb('banActionBanEndTime', '>=', banEndTime),
                  ])
                )
            )
        )
        .selectFrom('base_ban')
        .innerJoin('user as banned_user', 'banned_user.userId', 'base_ban.bannedUserId')
        .innerJoin('role as banned_user_role', 'banned_user_role.roleId', 'banned_user.userRoleId')
        .innerJoin(
          'userInfo as banned_user_info',
          'banned_user_info.userInfoUserId',
          'banned_user.userId'
        )
        .leftJoin('banRequest', (join) =>
          join
            .on('base_ban.status', '=', FindBanUsersStatus.Review)
            .onRef('banRequest.banRequestId', '=', 'base_ban.banId')
        )
        .leftJoin(
          'user as ban_requester',
          'ban_requester.userId',
          'banRequest.banRequestRequesterId'
        )
        .leftJoin('banAction', (join) =>
          join
            .on('base_ban.status', '=', FindBanUsersStatus.Banned)
            .onRef('banAction.banActionId', '=', 'base_ban.banId')
        )
        .leftJoin('user as banned_by_user', 'banned_by_user.userId', 'banAction.banActionBannedBy')
        .select((eb) => [
          'base_ban.banId as banId',
          'base_ban.status as status',

          // banned user
          'banned_user.userId as bannedUserId',
          'banned_user.userDisplayName as bannedUserDisplayname',
          'banned_user.userAvatarUrl as bannedUserAvatarUrl',
          'banned_user_info.userInfoLookingFor as bannedUserLookingFor',
          'banned_user_role.roleName as bannedUserRoleName',
          jsonObjectFrom(
            eb
              .selectFrom('pronoun')
              .whereRef('pronoun.pronounId', '=', 'banned_user_info.userInfoPronounId')
              .select(['pronoun.pronounId', 'pronoun.pronounName'])
          ).as('bannedUserPronoun'),
          jsonObjectFrom(
            eb
              .selectFrom('university')
              .select([
                'university.universityId',
                'university.universityName',
                'university.universityCountry',
              ])
              .whereRef('university.universityId', '=', 'banned_user_info.userInfoUniversityId')
          ).as('bannedUserUniversity'),
          jsonObjectFrom(
            eb
              .selectFrom('domain')
              .select(['domain.domainId', 'domain.domainName'])
              .whereRef('domain.domainId', '=', 'banned_user_info.userInfoDomainId')
          ).as('bannedUserDomain'),
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
              .whereRef(
                'banned_user_info.userInfoId',
                '=',
                'userInfoInterest.userInfoInterestUserInfoId'
              )
              .orderBy('userInfoInterestPosition', 'asc')
          ).as('bannedUserInterest'),
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
                'banned_user_info.userInfoId',
                '=',
                'userInfoPersonalGoal.userInfoPersonalGoalUserInfoId'
              )
              .orderBy('userInfoPersonalGoalPosition', 'asc')
          ).as('bannedUserPersonalGoal'),

          // proofs
          jsonArrayFrom(
            eb
              .selectFrom('banRequestProof')
              .whereRef(
                'banRequestProof.banRequestProofBanRequestId',
                '=',
                'banRequest.banRequestId'
              )
              .select([
                'banRequestProof.banRequestProofResourceId',
                'banRequestProof.banRequestProofResourceType',
              ])
          ).as('banRequestProofs'),
          jsonArrayFrom(
            eb
              .selectFrom('banRequestProof')
              .whereRef(
                'banRequestProof.banRequestProofBanRequestId',
                '=',
                'banAction.banActionBanRequestId'
              )
              .select([
                'banRequestProof.banRequestProofResourceId',
                'banRequestProof.banRequestProofResourceType',
              ])
          ).as('banActionProofs'),

          // ban request
          'banRequest.banRequestRequesterId',
          'ban_requester.userDisplayName as banRequestRequesterName',
          'banRequest.banRequestStatus',
          'banRequest.banRequestReason',
          'banRequest.banRequestCreatedTime',

          // ban action
          'banAction.banActionBannedBy',
          'banned_by_user.userDisplayName as bannedByUserName',
          'banAction.banActionReason',
          'banAction.banActionBanStartTime',
        ]);

      if (status) {
        query = query.where('base_ban.status', '=', status);
      }

      query = query.orderBy('base_ban.banCreatedTime', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const banUsers = await query.execute();

      return banUsers;
    } catch (error) {
      throw new CustomHttpException(
        `[${BanActionRepository.repoName}] | Fail to find ban users`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
