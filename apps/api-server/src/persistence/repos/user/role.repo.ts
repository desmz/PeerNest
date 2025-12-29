import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

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
        `[${RoleRepository.repoName}] | Fail to find role by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, name }
      );
    }
  }
}
