import { Module } from '@nestjs/common';

import { AttachmentRepository } from './attachment.repo';

@Module({
  providers: [AttachmentRepository],
  exports: [AttachmentRepository],
})
export class AttachmentModule {}
