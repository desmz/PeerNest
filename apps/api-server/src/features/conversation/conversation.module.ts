import { Module } from '@nestjs/common';

import { ConversationParticipantRepository } from './repo/conversation-participant.repo';
import { ConversationRepository } from './repo/conversation.repo';

@Module({
  imports: [],
  controllers: [],
  providers: [ConversationRepository, ConversationParticipantRepository],
  exports: [ConversationRepository, ConversationParticipantRepository],
})
export class ConversationModule {}
