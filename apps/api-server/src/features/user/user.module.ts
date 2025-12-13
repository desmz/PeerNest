import { Module } from '@nestjs/common';

import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { SystemModule } from '@/features/system/system.module';

import { AccountRepository } from './repos/account.repo';
import { RoleRepository } from './repos/role.repo';
import { UserInfoInterestRepository } from './repos/user-info-interest.repo';
import { UserInfoPersonalGoalRepository } from './repos/user-info-personal-goal.repo';
import { UserInfoRepository } from './repos/user-info.repo';
import { UserTokenRepository } from './repos/user-token.repo';
import { UserRepository } from './repos/user.repo';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [StorageModule, SystemModule],
  controllers: [UserController],
  providers: [
    AccountRepository,
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserInfoInterestRepository,
    UserInfoPersonalGoalRepository,
    UserService,
  ],
  exports: [
    AccountRepository,
    UserRepository,
    RoleRepository,
    UserTokenRepository,
    UserInfoRepository,
    UserInfoInterestRepository,
    UserInfoPersonalGoalRepository,
    UserService,
  ],
})
export class UserModule {}
