import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { authConfig, TAuthConfig } from '@/configs/auth.config';

import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [authConfig.KEY],
      useFactory: async (authConfig: TAuthConfig) => ({
        secret: authConfig.accessToken.secret,
        signOptions: {
          expiresIn: authConfig.accessToken.expiresIn,
        },
      }),
    }),
  ],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
