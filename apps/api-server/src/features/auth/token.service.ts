import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpErrorCode } from '@peernest/core';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';

import { TJwtPayload, JwtType, TJwtRawPayload } from './types/jwt-payload.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @AuthConfig() private readonly authConfig: TAuthConfig
  ) {}

  async generateAccessToken(user: TJwtRawPayload) {
    const payload: TJwtPayload = {
      sub: user.userId,
      email: user.userEmail,
      type: JwtType.Access,
    };

    return this.jwtService.sign(payload);
  }

  async verifyJwt(token: string, tokenType: JwtType) {
    const payload = await this.jwtService.verifyAsync(token, {
      secret: this.authConfig.accessToken.secret,
    });

    if (payload.type !== tokenType) {
      throw new CustomHttpException(
        'Invalid JWT token. Token type does not match.',
        HttpErrorCode.UNAUTHORIZED
      );
    }

    return payload;
  }
}
