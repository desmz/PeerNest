import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { ReportController } from './report/report.controller';
import { ReportService } from './report/report.service';

@Module({
  imports: [PersistenceModule],
  controllers: [ReportController],
  providers: [ReportService],
  exports: [ReportService],
})
export class ModerationModule {}
