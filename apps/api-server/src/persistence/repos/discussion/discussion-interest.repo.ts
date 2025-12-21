import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableDiscussionInterest,
  TKyselyTransaction,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class DiscussionInterestRepository {
  private static repoName = 'DISCUSSION_INTEREST_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  //* created time is not guaranteed, make sure the objs have the created time
  async createDiscussionInterests(
    discussionInterestObjs: TInsertableDiscussionInterest[],
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const discussionInterest = await db
        .insertInto('discussionInterest')
        .values(discussionInterestObjs)
        .returningAll()
        .executeTakeFirst();

      return discussionInterest!;
    } catch (error) {
      throw new CustomHttpException(
        `[${DiscussionInterestRepository.repoName}] | Fail to create discussion interest`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, discussionInterestObjs }
      );
    }
  }
}
