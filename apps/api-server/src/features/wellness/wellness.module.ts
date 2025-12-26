import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { WellnessController } from './wellness.controller';
import { WellnessService } from './wellness.service';

@Module({
  imports: [PersistenceModule],
  controllers: [WellnessController],
  providers: [WellnessService],
  exports: [WellnessService],
})
export class WellnessModule {}
