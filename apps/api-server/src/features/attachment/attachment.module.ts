import { Module } from '@nestjs/common';

import { PersistenceModule } from '@/persistence/persistence.module';

import { AttachmentController } from './attachment.controller';
import { AttachmentService } from './attachment.service';
import { StorageModule } from './plugins/storage.module';

@Module({
  imports: [StorageModule, PersistenceModule],
  controllers: [AttachmentController],
  providers: [AttachmentService],
  exports: [],
})
export class AttachmentModule {}
