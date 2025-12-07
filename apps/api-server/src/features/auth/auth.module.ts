import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AttachmentModule } from '@/features/attachment/attachment.module';
import { UserModule } from '@/features/user/user.module';

import { AccountRepository } from './account.repo';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
// import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from './token.module';

@Module({
  imports: [PassportModule, TokenModule, UserModule, AttachmentModule],
  controllers: [AuthController],
  providers: [JwtStrategy, AccountRepository, AuthService],
  exports: [AccountRepository],
})
export class AuthModule {}
