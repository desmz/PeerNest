import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AttachmentModule } from '@/features/attachment/attachment.module';
import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { UserModule } from '@/features/user/user.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AccountRepository } from './repos/account.repo';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from './token.module';

@Module({
  imports: [PassportModule, TokenModule, UserModule, StorageModule, AttachmentModule],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy, AccountRepository, AuthService],
  exports: [AccountRepository],
})
export class AuthModule {}
