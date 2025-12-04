import { INestApplication, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';
import helmet from 'helmet';

import { TAppConfig } from '@/configs/app.config';
import { TSecurityWebConfig } from '@/configs/bootstrap.config';
import { GlobalExceptionFilter } from '@/filters/global-exception.filter';
import { ResponseInterceptor } from '@/interceptors/response.interceptor';
import { ParseQueryParamsPipe } from '@/pipes/parse-query-params.pipe';

import { AppModule } from './app.module';

export async function setUpMiddleware(app: INestApplication, configService: ConfigService) {
  app.useGlobalPipes(new ParseQueryParamsPipe());
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter(configService));

  app.use(helmet());
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.use(cookieParser());

  const securityWebConfig = configService.getOrThrow<TSecurityWebConfig>('security.web');

  if (securityWebConfig?.cors.enabled) {
    app.enableCors({
      origin: securityWebConfig.cors.origin,
      methods: securityWebConfig.cors.methods,
      allowedHeaders: securityWebConfig.cors.allowedHeaders,
      credentials: securityWebConfig.cors.credentials,
      exposedHeaders: securityWebConfig.cors.exposedHeaders,
    });
  }
}

export async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const configService = app.get(ConfigService);
  const appConfig = configService.getOrThrow<TAppConfig>('app');

  // Setup logger
  const logger = new Logger(appConfig.brandName);
  app.useLogger(logger);
  app.flushLogs();

  app.enableShutdownHooks();

  // Prepare middleware and other configurations
  await setUpMiddleware(app, configService);

  await app.listen(appConfig.port ?? 3000);

  // Log system information
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  logger.log(`NODE_ENV is ${appConfig.nodeEnv}`);
  logger.log(`Ready on ${appConfig.apiBaseUrl}`);
  logger.log(`System Time Zone: ${timezone.toString()}`);
  logger.log(`Current System Time: ${new Date().toString()}`);

  // Handle unhandled exceptions and rejections
  process.on('unhandledRejection', (reason: string, promise: Promise<unknown>) => {
    logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    throw reason;
  });

  process.on('uncaughtException', (error) => {
    logger.error(error);
  });

  return app;
}
