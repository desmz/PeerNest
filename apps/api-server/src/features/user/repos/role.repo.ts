import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RoleRepository {
  private static repoName = 'ROLE_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async findRoleByName(name: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const role = await db
        .selectFrom('role')
        .selectAll()
        .where('roleName', '=', name)
        .executeTakeFirst();

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
