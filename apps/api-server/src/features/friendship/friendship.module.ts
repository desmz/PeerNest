import { Module } from '@nestjs/common';

import { ConversationModule } from '@/features/conversation/conversation.module';
import { UserModule } from '@/features/user/user.module';

import { FriendShipController } from './friendship.controller';
import { FriendShipService } from './friendship.service';
import { FriendRequestRepository } from './repo/friend-request.repo';
import { RelationshipRepository } from './repo/relationship.repo';

@Module({
  imports: [UserModule, ConversationModule],
  controllers: [FriendShipController],
  providers: [FriendRequestRepository, RelationshipRepository, FriendShipService],
  exports: [FriendRequestRepository, RelationshipRepository, FriendShipService],
})
export class FriendshipModule {}
