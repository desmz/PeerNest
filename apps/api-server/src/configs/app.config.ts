import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: envObj.NODE_ENV ?? 'development',
  port: envObj.PORT ?? 3000,
  brandName: envObj.BRAND_NAME ?? 'PeerNest',
  publicOrigin: envObj.PUBLIC_ORIGIN ?? 'http://localhost:3001',
  apiOrigin: envObj.API_ORIGIN ?? 'http://localhost:3000',
  apiBaseUrl: envObj.API_BASE_URL ?? 'http://localhost3000/api',
}));

export const AppConfig = () => Inject(appConfig.KEY);

export type TAppConfig = ConfigType<typeof appConfig>;
