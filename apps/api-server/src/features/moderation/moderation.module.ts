import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';

@Module({
  imports: [PersistenceModule, StorageModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ModerationModule {}
