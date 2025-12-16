import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { StorageModule } from '@/features/attachment/plugins/storage.module';
import { PersistenceModule } from '@/persistence/persistence.module';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TokenModule } from './token.module';

@Module({
  imports: [PassportModule, TokenModule, StorageModule, PersistenceModule],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy, AuthService],
  exports: [],
})
export class AuthModule {}
