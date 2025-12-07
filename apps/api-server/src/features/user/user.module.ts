import { Module } from '@nestjs/common';

import { AttachmentModule } from '@/features/attachment/attachment.module';
import { StorageModule } from '@/features/attachment/plugins/storage.module';

import { RoleRepository } from './role.repo';
import { UserController } from './user.controller';
import { UserRepository } from './user.repo';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule, AttachmentModule],
  controllers: [UserController],
  providers: [UserRepository, RoleRepository, UserService],
  exports: [UserRepository, RoleRepository, UserService],
})
export class UserModule {}
