import { Module } from '@nestjs/common';

import { AchievementModule } from '@/features/achievement/achievement.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { WellnessCheckInFormatter } from './wellness-check-in-formatter';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';

@Module({
  imports: [PersistenceModule, AchievementModule],
  controllers: [WellnessController],
  providers: [WellnessService, WellnessCheckInFormatter],
  exports: [WellnessService, WellnessCheckInFormatter],
})
export class WellnessModule {}
