import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { HttpErrorCode } from '@peernest/core';
import { TSelectableUser } from '@peernest/db';
import { Strategy } from 'passport-jwt';

import { type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';
import { UserRepository } from '@/features/user/user.repo';

import { TJwtPayload, JwtType } from '../types/jwt-payload.type';
import { fromCookie } from '../util';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    authConfig: TAuthConfig,
    private readonly userRepository: UserRepository
  ) {
    super({
      jwtFromRequest: fromCookie,
      ignoreExpiration: false,
      secretOrKey: authConfig.accessToken.secret,
    });
  }

  async validate(payload: TJwtPayload): Promise<TSelectableUser> {
    const { sub: userId, type } = payload;

    if (type !== JwtType.ACCESS) {
      throw new UnauthorizedException('Must use access token type');
    }

    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new CustomHttpException('User is unauthorized', HttpErrorCode.UNAUTHORIZED);
    }
    if (user.deletedTime) {
      throw new CustomHttpException(`User ${user.email} is disabled`, HttpErrorCode.FREEZE_ACCOUNT);
    }

    // set to cls

    return user;
  }
}
