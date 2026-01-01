import { Injectable } from '@nestjs/common';
import { TFindRoleApplicationsQueryParams } from '@peernest/contract';
import { generateRoleApplicationId, HttpErrorCode, RoleApplicationStatus } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableRoleApplication,
  TKyselyTransaction,
  TUpdatableRoleApplication,
} from '@peernest/db';
import { sql } from 'kysely';
import { jsonArrayFrom, jsonObjectFrom } from 'kysely/helpers/postgres';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RoleApplicationRepository {
  private static repoName = 'ROLE_APPLICATION_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createRoleApplication(
    roleApplicationObj: TInsertableRoleApplication,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = roleApplicationObj.roleApplicationCreatedTime
        ? roleApplicationObj.roleApplicationCreatedTime
        : new Date();

      const roleApplication = await db
        .insertInto('roleApplication')
        .values({
          ...roleApplicationObj,
          roleApplicationId: roleApplicationObj.roleApplicationId
            ? roleApplicationObj.roleApplicationId
            : generateRoleApplicationId(),
          roleApplicationCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return roleApplication!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to create role application`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, roleApplicationObj }
      );
    }
  }

  async updateRoleApplicationById(
    roleApplicationPayload: TUpdatableRoleApplication,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = roleApplicationPayload.roleApplicationUpdatedTime
        ? roleApplicationPayload.roleApplicationUpdatedTime
        : new Date();

      const roleApplication = await db
        .updateTable('roleApplication')
        .set({
          ...roleApplicationPayload,
          roleApplicationUpdatedTime: now,
        })
        .where('roleApplicationId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return roleApplication!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to update role application by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, roleApplicationPayload }
      );
    }
  }

  async updateRoleApplicationByIds(
    roleApplicationPayload: TUpdatableRoleApplication,
    ids: { applicantId: string; appliedRoleId: string },
    options?: { statuses: RoleApplicationStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { applicantId, appliedRoleId } = ids;

      const { statuses } = options || {};

      const now = roleApplicationPayload.roleApplicationUpdatedTime
        ? roleApplicationPayload.roleApplicationUpdatedTime
        : new Date();

      let query = db
        .updateTable('roleApplication')
        .set({
          ...roleApplicationPayload,
          roleApplicationUpdatedTime: now,
        })
        .where('roleApplicationApplicantId', '=', applicantId)
        .where('roleApplicationAppliedRoleId', '=', appliedRoleId);

      if (statuses && statuses.length > 0) {
        query = query.where('roleApplicationStatus', 'in', statuses);
      }

      const roleApplication = await query.returningAll().executeTakeFirst();

      return roleApplication!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to update role application by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, roleApplicationPayload, options }
      );
    }
  }

  async findRoleApplicationByIds(
    ids: { applicantId: string; appliedRoleId: string },
    options?: { includedDeleted?: boolean; statuses: RoleApplicationStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { applicantId, appliedRoleId } = ids;

      const { statuses, includedDeleted } = options || {};

      let query = db
        .selectFrom('roleApplication')
        .selectAll()
        .where('roleApplicationApplicantId', '=', applicantId)
        .where('roleApplicationAppliedRoleId', '=', appliedRoleId);

      if (statuses && statuses.length > 0) {
        query = query.where('roleApplicationStatus', 'in', statuses);
      }

      if (!includedDeleted) {
        query = query.where('roleApplicationDeletedTime', 'is', null);
      }

      const roleApplication = await query.executeTakeFirst();

      return roleApplication;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to find role application by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids, options }
      );
    }
  }

  async findRoleApplicationById(
    id: string,
    options?: { includedDeleted?: boolean; statuses: RoleApplicationStatus[] },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { statuses, includedDeleted } = options || {};

      let query = db.selectFrom('roleApplication').selectAll().where('roleApplicationId', '=', id);

      if (statuses && statuses.length > 0) {
        query = query.where('roleApplicationStatus', 'in', statuses);
      }

      if (!includedDeleted) {
        query = query.where('roleApplicationDeletedTime', 'is', null);
      }

      const roleApplication = await query.executeTakeFirst();

      return roleApplication;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to find role application by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }

  // special task
  //* Only find for pending role applications
  async findRoleApplications(options?: TFindRoleApplicationsQueryParams, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { limit = 500, offset = 0, roles } = options || {};

      let query = db
        .with('base_role_application', (eb) =>
          eb
            .selectFrom('roleApplication')
            .innerJoin('role', 'role.roleId', 'roleApplication.roleApplicationAppliedRoleId')
            .where('roleApplicationStatus', '=', RoleApplicationStatus.Pending)
            .where((eb) => {
              if (roles && roles.length > 0) {
                return eb('role.roleName', 'in', roles);
              } else {
                return sql`true`;
              }
            })
            .selectAll()
        )
        .selectFrom('base_role_application')
        .innerJoin(
          'user as applicant',
          'applicant.userId',
          'base_role_application.roleApplicationApplicantId'
        )
        .innerJoin('role as applicant_role', 'applicant_role.roleId', 'applicant.userRoleId')
        .innerJoin(
          'userInfo as applicant_user_info',
          'applicant_user_info.userInfoUserId',
          'applicant.userId'
        )
        .select((eb) => [
          'base_role_application.roleApplicationId',
          'base_role_application.roleApplicationStatus',
          'base_role_application.roleApplicationDescription',
          'base_role_application.roleApplicationCreatedTime',

          // role
          'applicant_role.roleId',
          'applicant_role.roleName',
          eb.cast<number>('applicant_role.roleRank', 'integer').as('roleRank'),

          // applicant
          'applicant.userId as applicantUserId',
          'applicant.userDisplayName as applicantUserDisplayname',
          'applicant.userAvatarUrl as applicantUserAvatarUrl',
          'applicant_user_info.userInfoLookingFor as applicantUserLookingFor',
          'applicant_role.roleName as applicantUserRoleName',
          jsonObjectFrom(
            eb
              .selectFrom('pronoun')
              .whereRef('pronoun.pronounId', '=', 'applicant_user_info.userInfoPronounId')
              .select(['pronoun.pronounId', 'pronoun.pronounName'])
          ).as('applicantPronoun'),
          jsonObjectFrom(
            eb
              .selectFrom('university')
              .select([
                'university.universityId',
                'university.universityName',
                'university.universityCountry',
              ])
              .whereRef('university.universityId', '=', 'applicant_user_info.userInfoUniversityId')
          ).as('applicantUniversity'),
          jsonObjectFrom(
            eb
              .selectFrom('domain')
              .select(['domain.domainId', 'domain.domainName'])
              .whereRef('domain.domainId', '=', 'applicant_user_info.userInfoDomainId')
          ).as('applicantDomain'),
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
                'applicant_user_info.userInfoId',
                '=',
                'userInfoInterest.userInfoInterestUserInfoId'
              )
              .orderBy('userInfoInterestPosition', 'asc')
          ).as('applicantInterest'),
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
                'applicant_user_info.userInfoId',
                '=',
                'userInfoPersonalGoal.userInfoPersonalGoalUserInfoId'
              )
              .orderBy('userInfoPersonalGoalPosition', 'asc')
          ).as('applicantPersonalGoal'),

          // attachments
          jsonArrayFrom(
            eb
              .selectFrom('roleAttachment')
              .innerJoin(
                'attachment',
                'attachment.attachmentId',
                'roleAttachment.roleAttachmentAttachmentId'
              )
              .whereRef(
                'roleAttachment.roleAttachmentRoleApplicationId',
                '=',
                'base_role_application.roleApplicationId'
              )
              .select(['attachment.attachmentPath', 'attachment.attachmentMimetype'])
          ).as('attachments'),
        ]);

      query = query.orderBy('base_role_application.roleApplicationCreatedTime', 'desc');

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.offset(offset);
      }

      const roleApplications = await query.execute();

      return roleApplications;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleApplicationRepository.repoName}] | Fail to find role applications `,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
