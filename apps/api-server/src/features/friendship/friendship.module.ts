import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { FriendShipController } from './friendship.controller';
import { FriendShipService } from './friendship.service';

@Module({
  imports: [PersistenceModule],
  controllers: [FriendShipController],
  providers: [FriendShipService],
  exports: [FriendShipService],
})
export class FriendshipModule {}
