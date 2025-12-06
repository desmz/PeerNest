import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config/dynamic';

export const loggerConfig = registerAs('logger', () => ({
  isEnableGlobalLogging: envObj.ENABLE_GLOBAL_ERROR_LOGGING,
}));

export const LoggerConfig = () => Inject(loggerConfig.KEY);

export type TLoggerConfig = ConfigType<typeof loggerConfig>;
