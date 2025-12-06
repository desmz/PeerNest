import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config/dynamic';

export const securityWebConfig = registerAs('security.web', () => ({
  cors: {
    enabled: true,
    origin: [envObj.PUBLIC_ORIGIN ?? 'http://localhost:3001'],
    methods: ['OPTIONS', 'GET', 'DELETE', 'PATCH', 'POST', 'PUT'],
    allowedHeaders: [
      'X-CSRF-Token',
      'X-Requested-With',
      'Accept',
      'Accept-Version',
      'Content-Length',
      'Content-MD5',
      'Content-Type',
      'Date',
      'X-Api-Version',
      'Authorization',
    ],
    credentials: true,
    exposedHeaders: ['Authorization'],
  },
}));

export const SecurityWebConfig = () => Inject(securityWebConfig.KEY);

export type TSecurityWebConfig = ConfigType<typeof securityWebConfig>;
