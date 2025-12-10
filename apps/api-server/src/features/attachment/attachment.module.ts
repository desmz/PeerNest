import { Module } from '@nestjs/common';

import { AttachmentRepository } from './repos/attachment.repo';

@Module({
  providers: [AttachmentRepository],
  exports: [AttachmentRepository],
})
export class AttachmentModule {}
