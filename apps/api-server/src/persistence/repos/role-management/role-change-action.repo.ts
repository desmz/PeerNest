import { Injectable } from '@nestjs/common';
import { generateRoleChangeActionId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableRoleChangeAction,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RoleChangeActionRepository {
  private static repoName = 'ROLE_CHANGE_ACTION_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createRoleChangeAction(
    roleChangeActionObj: TInsertableRoleChangeAction,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = roleChangeActionObj.roleChangeActionCreatedTime
        ? roleChangeActionObj.roleChangeActionCreatedTime
        : new Date();

      const roleChangeAction = await db
        .insertInto('roleChangeAction')
        .values({
          ...roleChangeActionObj,
          roleChangeActionId: roleChangeActionObj.roleChangeActionId
            ? roleChangeActionObj.roleChangeActionId
            : generateRoleChangeActionId(),
          roleChangeActionCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return roleChangeAction!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleChangeActionRepository.repoName}] | Fail to create role change action`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, roleChangeActionObj }
      );
    }
  }
}
