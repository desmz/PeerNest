import { Module } from '@nestjs/common';

import { AchievementModule } from '@/features/achievement/achievement.module';
import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { MeController } from './me.controller';
import { MeService } from './me.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [PersistenceModule, StorageModule, AchievementModule],
  controllers: [MeController, UserController],
  providers: [MeService, UserService],
  exports: [MeService, UserService],
})
export class UserModule {}
