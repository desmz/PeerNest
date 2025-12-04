import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { generateTimestamp } from '@peernest/core';
import { Response, Request } from 'express';

import { TLoggerConfig } from '@/configs/logger.config';
import { exceptionParse } from '@/utils/exception-parse';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const loggerConfig = this.configService.getOrThrow<TLoggerConfig>('logger');
    if (loggerConfig.isEnableGlobalLogging) {
      this.logError(exception, req);
    }

    const customException = exceptionParse(exception);
    const status = customException.getStatus();

    return res.status(status).json({
      success: false,
      meta: {
        path: req.url,
        status,
        timestamp: generateTimestamp(),
      },
      error: {
        code: customException.code,
        message: customException.message,
      },
      details: customException.details,
    });
  }

  private logError(exception: Error, req: Request) {
    this.logger.error(
      {
        path: req.url,
        message: exception.message,
      },
      exception.stack
    );
  }
}
