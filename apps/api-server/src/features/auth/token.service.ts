import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpErrorCode } from '@peernest/core';
import { TSelectableUser } from '@peernest/db';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';

import { TJwtPayload, JwtType } from './types/jwt-payload.type';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    @AuthConfig() private readonly authConfig: TAuthConfig
  ) {}

  async generateAccessToken(user: TSelectableUser) {
    const payload: TJwtPayload = {
      sub: user.id,
      email: user.email,
      type: JwtType.ACCESS,
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
