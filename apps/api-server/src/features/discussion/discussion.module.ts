import { Module } from '@nestjs/common';

import { AchievementModule } from '@/features/achievement/achievement.module';
import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { DiscussionController } from './discussion.controller';
import { DiscussionService } from './discussion.service';

@Module({
  imports: [PersistenceModule, StorageModule, AchievementModule],
  controllers: [DiscussionController],
  providers: [DiscussionService],
  exports: [DiscussionService],
})
export class DiscussionModule {}
