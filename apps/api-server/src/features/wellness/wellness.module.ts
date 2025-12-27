import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { WellnessCheckInFormatter } from './wellness-check-in-formatter';
import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';

@Module({
  imports: [PersistenceModule],
  controllers: [WellnessController],
  providers: [WellnessService, WellnessCheckInFormatter],
  exports: [WellnessService, WellnessCheckInFormatter],
})
export class WellnessModule {}
