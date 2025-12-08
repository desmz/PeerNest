import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config/dynamic';
import { AUTH_COOKIE_MAX_AGE, AUTH_COOKIE_NAME } from '@peernest/core';
import ms, { StringValue } from 'ms';

export const authConfig = registerAs('auth', () => ({
  accessToken: {
    secret:
      envObj.AUTH_JWT_ACCESS_SECRET ??
      'aa8fa9c9e4d7749644ea910236c01a24457401c1c110311244756989394236d4',
    expiresIn: (envObj.AUTH_JWT_ACCESS_EXPIRES_IN ?? '15m') as StringValue,
  },
  cookie: {
    name: AUTH_COOKIE_NAME,
    maxAge: ms(AUTH_COOKIE_MAX_AGE ?? '10m'),
  },
  socialProviders: envObj.SOCIAL_AUTH_PROVIDERS,
  google: {
    clientId: envObj.BACKEND_GOOGLE_CLIENT_ID,
    clientSecret: envObj.BACKEND_GOOGLE_CLIENT_SECRET,
    callbackUrl: envObj.BACKEND_GOOGLE_CALLBACK_URL,
  },
  // resetPasswordToken: {
  //   secret:
  //     envObj.GENERAL_TOKEN_SECRET ??
  //     '6c90a1d04ddaad510358ec12b83348565ecaa49ecf16a062c360ab3bd295dc44',
  //   expiresIn: envObj.GENERAL_TOKEN_EXPIRES_IN ?? '5m',
  // },
  // emailVerificationToken: {
  //   expiresIn: envObj.GENERAL_TOKEN_EXPIRES_IN ?? '5m',
  // },
}));

export const AuthConfig = () => Inject(authConfig.KEY);

export type TAuthConfig = ConfigType<typeof authConfig>;
