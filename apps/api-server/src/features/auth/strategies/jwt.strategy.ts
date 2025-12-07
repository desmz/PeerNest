import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type TMeVo } from '@peernest/contract';
import { ACCESS_TOKEN_STRATEGY_NAME, HttpErrorCode } from '@peernest/core';
import { Strategy } from 'passport-jwt';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';
import { UserRepository } from '@/features/user/user.repo';

import { TJwtPayload, JwtType } from '../types/jwt-payload.type';
import { fromCookie, pickUserMe } from '../utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, ACCESS_TOKEN_STRATEGY_NAME) {
  constructor(
    @AuthConfig() authConfig: TAuthConfig,
    private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: fromCookie,
      ignoreExpiration: false,
      secretOrKey: authConfig.accessToken.secret,
    });
  }

  async validate(payload: TJwtPayload): Promise<TMeVo> {
    const { sub: userId, type } = payload;

    if (type !== JwtType.ACCESS) {
      throw new UnauthorizedException('Must use access token type');
    }

    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new CustomHttpException('User is unauthorized', HttpErrorCode.UNAUTHORIZED);
    }
    if (user.userDeletedTime) {
      throw new CustomHttpException(
        `User ${user.userEmail} is disabled`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    // set to cls

    return pickUserMe(user);
  }
}
