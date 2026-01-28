import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { type TMeVo } from '@peernest/contract';
import { ACCESS_TOKEN_STRATEGY_NAME, HttpErrorCode, UserRole } from '@peernest/core';
import { ClsService } from 'nestjs-cls';
import { Strategy } from 'passport-jwt';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';
import { BanActionRepository } from '@/persistence/repos/ban';
import { UserRepository } from '@/persistence/repos/user';
import { IClsStore } from '@/types/cls';

import { TJwtPayload, JwtType } from '../types/jwt-payload.type';
import { fromCookie, pickUserMe } from '../utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, ACCESS_TOKEN_STRATEGY_NAME) {
  constructor(
    @AuthConfig() authConfig: TAuthConfig,
    private readonly clsService: ClsService<IClsStore>,

    private readonly banActionRepository: BanActionRepository,
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

    if (type !== JwtType.Access) {
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

    const now = new Date();
    const isBanned = await this.banActionRepository.validateIfUserIsBanned(userId, now);

    if (isBanned) {
      throw new CustomHttpException(
        `You have been banned or suspended`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    this.clsService.set('user.email', user.userEmail);
    this.clsService.set('user.id', user.userId);
    this.clsService.set('user.role', user.roleName as UserRole);
    this.clsService.set('user.roleRank', parseInt(user.roleRank));

    return pickUserMe(user);
  }
}
