import { Injectable } from '@nestjs/common';
import { generateAttachmentId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableAttachment, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class AttachmentRepository {
  private static repoName = 'ATTACHMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createAttachment(attachmentObj: TInsertableAttachment, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = attachmentObj.attachmentCreatedTime
        ? attachmentObj.attachmentCreatedTime
        : new Date();

      const attachment = await db
        .insertInto('attachment')
        .values({
          ...attachmentObj,
          attachmentId: attachmentObj.attachmentId
            ? attachmentObj.attachmentId
            : generateAttachmentId(),
          attachmentCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return attachment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${AttachmentRepository.repoName}] | Fail to create attachment`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, attachmentObj }
      );
    }
  }

  // async findAttachmentById(
  //   id: string,
  //   options?: { includedDeleted?: boolean },
  //   tx?: TKyselyTransaction
  // ) {
  //   try {
  //     const db = dbOrTx(this.kyselyService.db, tx);

  //     let query = db
  //       .selectFrom('user')
  //       .innerJoin('role', 'role.roleId', 'user.userRoleId')
  //       .selectAll(['user', 'role'])
  //       .where('userId', '=', id);

  //     if (!options?.includedDeleted) {
  //       query = query.where('userDeletedTime', 'is', null);
  //     }

  //     const user = await query.executeTakeFirst();

  //     return user;
  //   } catch (error) {
  //     throw new CustomHttpException(
  //       `[${AttachmentRepository.repoName}] | Fail to find user by id`,
  //       HttpErrorCode.INTERNAL_SERVER_ERROR,
  //       { error, id }
  //     );
  //   }
  // }
}
