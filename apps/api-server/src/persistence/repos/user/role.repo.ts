import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction, TSelectableRole } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RoleRepository {
  private static repoName = 'ROLE_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findRoleByName(
    name: string,
    option?: {
      includedDeleted?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted } = option || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('role').selectAll().where('roleName', '=', name);

      if (!includedDeleted) {
        query = query.where('roleDeletedTime', 'is', null);
      }

      const role = await query.executeTakeFirst();

      return role;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleRepository.repoName}] | Fail to find role by name`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, name }
      );
    }
  }

  async findRoleById(
    id: string,
    option?: {
      includedDeleted?: boolean;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted } = option || {};

      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('role').selectAll().where('roleId', '=', id);

      if (!includedDeleted) {
        query = query.where('roleDeletedTime', 'is', null);
      }

      const role = await query.executeTakeFirst();

      return role;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleRepository.repoName}] | Fail to find role by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id }
      );
    }
  }

  async findRoles(
    options?: {
      includedDeleted?: boolean;
      orderBy?: keyof TSelectableRole | undefined;
      ordering?: 'asc' | 'desc' | undefined;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const { includedDeleted, orderBy, ordering } = options || {};
      const db = dbOrTx(this.kyselyService.db, tx);

      let query = db.selectFrom('role').selectAll();

      if (!includedDeleted) {
        query = query.where('roleDeletedTime', 'is', null);
      }

      if (orderBy) {
        query = query.orderBy(orderBy, ordering || 'asc');
      }

      const roles = await query.execute();

      return roles;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleRepository.repoName}] | Fail to find roles`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, options }
      );
    }
  }
}
