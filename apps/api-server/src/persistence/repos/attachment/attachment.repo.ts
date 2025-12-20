import { Injectable } from '@nestjs/common';
import { AttachmentStatus, generateAttachmentId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableAttachment,
  TKyselyTransaction,
  TUpdatableAttachment,
} from '@peernest/db';

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

  async updateAttachmentByOwnerId(
    attachmentPayload: TUpdatableAttachment,
    ownerId: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = attachmentPayload.attachmentUpdatedTime
        ? attachmentPayload.attachmentUpdatedTime
        : new Date();

      const attachment = await db
        .updateTable('attachment')
        .set({
          ...attachmentPayload,
          attachmentUpdatedTime: now,
        })
        .where('attachmentOwnerId', '=', ownerId)
        .returningAll()
        .executeTakeFirst();

      return attachment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${AttachmentRepository.repoName}] | Fail to update attachment by owner id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, attachmentPayload, ownerId }
      );
    }
  }
  async updateAttachmentById(
    attachmentPayload: TUpdatableAttachment,
    id: string,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = attachmentPayload.attachmentUpdatedTime
        ? attachmentPayload.attachmentUpdatedTime
        : new Date();

      const attachment = await db
        .updateTable('attachment')
        .set({
          ...attachmentPayload,
          attachmentUpdatedTime: now,
        })
        .where('attachmentId', '=', id)
        .returningAll()
        .executeTakeFirst();

      return attachment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${AttachmentRepository.repoName}] | Fail to update attachment by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, attachmentPayload, id }
      );
    }
  }

  async findAttachmentById(
    id: string,
    options?: { status: AttachmentStatus },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { status } = options || {};

      let query = db.selectFrom('attachment').selectAll().where('attachmentId', '=', id);

      if (status) {
        query = query.where('attachmentStatus', '=', status);
      }

      const attachment = await query.executeTakeFirst();

      return attachment;
    } catch (error) {
      throw new CustomHttpException(
        `[${AttachmentRepository.repoName}] | Fail to find attachment by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, id, options }
      );
    }
  }
}
