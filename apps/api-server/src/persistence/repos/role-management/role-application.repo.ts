import { Injectable } from '@nestjs/common';
import { generateRoleApplicationId, HttpErrorCode, RoleApplicationStatus } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableRoleApplication,
  TKyselyTransaction,
  TUpdatableRoleApplication,
} from '@peernest/db';

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
}
