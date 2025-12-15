import { Injectable } from '@nestjs/common';
import { ConversationType, generateConversationId, HttpErrorCode } from '@peernest/core';
import { dbOrTx, KyselyService, TInsertableConversation, TKyselyTransaction } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class ConversationRepository {
  private static repoName = 'CONVERSATION_REPO';

  constructor(private readonly kyselyService: KyselyService) {}

  async createConversation(conversationObj: TInsertableConversation, tx?: TKyselyTransaction) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const now = conversationObj.conversationCreatedTime
        ? conversationObj.conversationCreatedTime
        : new Date();

      const conversation = await db
        .insertInto('conversation')
        .values({
          ...conversationObj,
          conversationId: conversationObj.conversationId
            ? conversationObj.conversationId
            : generateConversationId(),
          conversationCreatedTime: now,
        })
        .returningAll()
        .executeTakeFirst();

      return conversation!;
    } catch (error) {
      throw new CustomHttpException(
        `[${ConversationRepository.repoName}] | Fail to create conversation`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, conversationObj }
      );
    }
  }

  async findConversationByParticipantIds(
    participantIds: string[],
    options?: {
      conversationType?: ConversationType;
    },
    tx?: TKyselyTransaction
  ) {
    try {
      const db = dbOrTx(this.kyselyService.db, tx);

      const participantNumber = participantIds.length;
      const { conversationType } = options || {};

      const query = db
        .with('conversation_candidate', (qb) =>
          qb
            .selectFrom('conversationParticipant')
            .where('conversationParticipantParticipantId', 'in', participantIds)
            .groupBy('conversationParticipantConversationId')
            .having(({ fn, eb }) =>
              eb(fn.count('conversationParticipantParticipantId'), '=', participantNumber)
            )
            .select([
              'conversationParticipantConversationId as conversation_candidate_conversation_id',
            ])
        )
        .selectFrom('conversation_candidate')
        .innerJoin(
          'conversation',
          'conversation.conversationId',
          'conversation_candidate.conversation_candidate_conversation_id'
        )
        .innerJoin(
          'conversationParticipant',
          'conversationParticipant.conversationParticipantConversationId',
          'conversation.conversationId'
        )
        .$if(Boolean(conversationType), (eb) =>
          eb.where('conversation.conversationType', '=', conversationType!)
        )
        .groupBy('conversation.conversationId')
        .having(({ fn, eb }) =>
          eb(fn.count('conversationParticipantParticipantId'), '=', participantNumber)
        )
        .selectAll('conversation');

      const conversation = await query.executeTakeFirst();

      return conversation;
    } catch (error) {
      throw new CustomHttpException(
        `[${ConversationRepository.repoName}] | Fail to find conversation by participant ids`,
        HttpErrorCode.INTERNAL_SERVER_ERROR,
        { error, participantIds }
      );
    }
  }
}
