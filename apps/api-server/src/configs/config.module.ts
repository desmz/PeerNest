import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';

import { appConfig } from './app.config';
import { authConfig } from './auth.config';
import { securityWebConfig } from './bootstrap.config';
import { loggerConfig } from './logger.config';
import { mailConfig } from './mail.config';
import { storageConfig } from './storage.config';

const configurations = [
  securityWebConfig,
  appConfig,
  authConfig,
  loggerConfig,
  storageConfig,
  mailConfig,
];

@Module({})
export class ConfigModule {
  static async register(): Promise<DynamicModule> {
    return await BaseConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      expandVariables: true,
      load: configurations,
      envFilePath: ['.env.development', '.env.development.local', '.env'],
      // validate: (config) => envValidationSchema.parse(config),
    });
  }
}
