import { Injectable } from '@nestjs/common';
import { generateDiscussionId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussionAttachment,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionAttachmentRepository {
  private static repoName = 'DISCUSSION_ATTACHMENT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async createDiscussionAttachment(
    discussionAttachmentObj: TInsertableDiscussionAttachment,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const discussionAttachment = await db
        .insertInto('discussionAttachment')
        .values({
          ...discussionAttachmentObj,
          discussionAttachmentId: discussionAttachmentObj.discussionAttachmentId
            ? discussionAttachmentObj.discussionAttachmentId
            : generateDiscussionId(),
        })
        .returningAll()
        .executeTakeFirst();

      return discussionAttachment!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionAttachmentRepository.repoName}] | Fail to create discussion attachment`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionAttachmentObj }
      );
    }
  }

  async findDiscussionAttachmentByIds(
    ids: { discussionId: string; attachmentId: string },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const { discussionId, attachmentId } = ids;

      const discussionAttachment = await db
        .selectFrom('discussionAttachment')
        .selectAll()
        .where('discussionAttachmentDiscussionId', '=', discussionId)
        .where('discussionAttachmentDiscussionId', '=', attachmentId)
        .executeTakeFirst();

      return discussionAttachment;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionAttachmentRepository.repoName}] | Fail to find discussion attachment by ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, ids }
      );
    }
  }

  async deleteDiscussionAttachmentByDiscussionId(discussionId: string, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      await db
        .deleteFrom('discussionAttachment')
        .where('discussionAttachmentId', '=', discussionId)
        .executeTakeFirst();
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionAttachmentRepository.repoName}] | Fail to delete discussion attachment by id`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionId }
      );
    }
  }
}
