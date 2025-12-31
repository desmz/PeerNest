import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { BanController } from './ban/ban.controller';
import { BanService } from './ban/ban.service';
import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';

@Module({
  imports: [PersistenceModule, StorageModule],
  controllers: [ReportController, BanController],
  providers: [ReportService, BanService],
  exports: [ReportService, BanService],
})
export class ModerationModule {}
