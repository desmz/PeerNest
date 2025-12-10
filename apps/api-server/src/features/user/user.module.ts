import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';

import { RoleRepository } from './repos/role.repo';
import { UserTokenRepository } from './repos/user-token.repo';
import { UserRepository } from './repos/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule],
  controllers: [UserController],
  providers: [UserRepository, RoleRepository, UserTokenRepository, UserService],
  exports: [UserRepository, RoleRepository, UserTokenRepository, UserService],
})
export class UserModule {}
