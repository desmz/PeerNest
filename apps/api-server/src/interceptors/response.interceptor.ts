import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { generateTimestamp, TApiResponse } from '@peernest/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, TApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<TApiResponse<T>> {
    return next.handle().pipe(map((data) => this.responseHandler(data, context)));
  }

  private responseHandler(data: T, context: ExecutionContext): TApiResponse<T> {
    const ctx = context.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    return {
      success: true,
      data,
      meta: {
        path: req.url,
        status: res.statusCode,
        timestamp: generateTimestamp(),
      },
    };
  }
}
