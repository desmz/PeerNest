import { Injectable } from '@nestjs/common';
import { generateRoleAttachmentId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableRoleAttachment, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class RoleAttachmentRepository {
  private static repoName = 'ROLE_ATTACHMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createRoleAttachment(
    roleAttachmentObj: TInsertableRoleAttachment,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const roleAttachment = await db
        .insertInto('roleAttachment')
        .values({
          ...roleAttachmentObj,
          roleAttachmentId: roleAttachmentObj.roleAttachmentId
            ? roleAttachmentObj.roleAttachmentId
            : generateRoleAttachmentId(),
        })
        .returningAll()
        .executeTakeFirst();

      return roleAttachment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${RoleAttachmentRepository.repoName}] | Fail to create role attachment`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, roleAttachmentObj }
      );
    }
  }
}
