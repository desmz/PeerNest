import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { GOOGLE_OAUTH_STRATEGY_NAME, HttpErrorCode } from '@peernest/core';
import { Profile, Strategy } from 'passport-google-oauth20';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { CustomHttpException } from '@/custom.exception';

import { TGoogleAuthRo } from '../types/social-auth.type';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, GOOGLE_OAUTH_STRATEGY_NAME) {
  constructor(@AuthConfig() authConfig: TAuthConfig) {
    super({
      clientID: authConfig.google.clientId,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackUrl,
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile
  ): Promise<TGoogleAuthRo> {
    const { id, emails, displayName, photos } = profile;
    const email = emails?.[0].value;

    if (!email) {
      throw new CustomHttpException('No email provided from google', HttpErrorCode.UNAUTHORIZED);
    }

    return {
      id,
      email,
      displayName,
      avatarUrl: photos?.[0].value,
    };
  }
}
