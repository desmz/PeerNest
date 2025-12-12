import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';

import { AccountRepository } from './repos/account.repo';
import { RoleRepository } from './repos/role.repo';
import { UserInfoRepository } from './repos/user-info.repo';
import { UserTokenRepository } from './repos/user-token.repo';
import { UserRepository } from './repos/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule],
  controllers: [UserController],
  providers: [
    AccountRepository,
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserService,
  ],
  exports: [
    AccountRepository,
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserService,
  ],
})
export class UserModule {}
