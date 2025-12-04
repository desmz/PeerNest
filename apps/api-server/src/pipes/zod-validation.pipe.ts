import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import { formatZodError, HttpErrorCode } from '@peernest/core';
import { z } from 'zod';

import { CustomHttpException } from '@/custom.exception';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: unknown) {}

  public transform(value: unknown, _metadata: ArgumentMetadata): unknown {
    try {
      return (this.schema as z.Schema).parse(value);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        const errors = formatZodError(error);

        throw new CustomHttpException(
          'Request object validation failed',
          HttpErrorCode.VALIDATION_ERROR,
          errors
        );
      }

      throw error;
    }
  }
}
