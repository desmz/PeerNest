import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';

import { MeController } from './me/me.controller';
import { MeService } from './me/me.service';
import { RoleRepository } from './repos/role.repo';
import { UserInfoRepository } from './repos/user-info.repo';
import { UserTokenRepository } from './repos/user-token.repo';
import { UserRepository } from './repos/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule],
  controllers: [UserController, MeController],
  providers: [
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserService,
    MeService,
  ],
  exports: [
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserService,
    MeService,
  ],
})
export class UserModule {}
