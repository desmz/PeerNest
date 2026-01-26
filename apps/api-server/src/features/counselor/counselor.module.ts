import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { CounselorController } from './counselor.controller';
import { CounselorService } from './counselor.service';

@Module({
  imports: [PersistenceModule],
  controllers: [CounselorController],
  providers: [CounselorService],
  exports: [CounselorService],
})
export class CounselorModule {}
