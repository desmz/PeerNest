import { Injectable } from '@nestjs/common';
import { generateConversationParticipantId, HttpErrorCode } from '@peernest/core';
import {
  dbOrTx,
  KyselyService,
  TInsertableConversationParticipant,
  TKyselyTransaction,
  TUpdatableConversationParticipant,
} from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class ConversationParticipantRepository {
  private static repoName = 'CONVERSATION_PARTICIPANT_REPOSITORY';

  constructor(private readonly kyselyService: KyselyService) {}

  async upsertConversationParticipant(
    conversationParticipantObj: TInsertableConversationParticipant,
    conversationParticipantPayload: TUpdatableConversationParticipant,
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const joinedTimeNow = conversationParticipantObj.conversationParticipantJoinedTime
        ? conversationParticipantObj.conversationParticipantJoinedTime
        : new Date();

      const conversationParticipant = await db
        .insertInto('conversationParticipant')
        .values({
          ...conversationParticipantObj,
          conversationParticipantId: conversationParticipantObj.conversationParticipantId
            ? conversationParticipantObj.conversationParticipantId
            : generateConversationParticipantId(),
          conversationParticipantJoinedTime: joinedTimeNow,
        })
        .onConflict((oc) =>
          oc
            .columns([
              'conversationParticipantConversationId',
              'conversationParticipantParticipantId',
            ])
            .doUpdateSet({ ...conversationParticipantPayload })
        )
        .returningAll()
        .executeTakeFirst();

      return conversationParticipant!;
    } catch (error) {
      throw new CustomHttpException(
        `[${ConversationParticipantRepository.repoName}] | Fail to upsert account`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, conversationParticipantObj, conversationParticipantPayload }
      );
    }
  }
}
