import { Module, DynamicModule } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';

import { appConfig } from './app.config';
import { securityWebConfig } from './bootstrap.config';
import { loggerConfig } from './logger.config';

const configurations = [securityWebConfig, appConfig, loggerConfig];

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
