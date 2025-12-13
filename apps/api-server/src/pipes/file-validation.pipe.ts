import { extname } from 'path';

import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import { type TFileValidationOptions } from '@/types/file-validation-pipe';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly options: TFileValidationOptions) {}

  transform(file: Express.Multer.File, _metadata: ArgumentMetadata) {
    const { allowedFileExt, maxFileSize, fieldName: providedFieldName } = this.options;

    const fieldName = providedFieldName || 'file';
    if (!file) {
      throw new CustomHttpException(`${fieldName} is required`, HttpErrorCode.VALIDATION_ERROR);
    }

    const fileSize = file.size;
    if (fileSize > maxFileSize) {
      throw new CustomHttpException(
        `${fieldName} cannot larger than ${maxFileSize / 1024 / 1024}MB`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const ext = extname(file.originalname).toLowerCase();
    if (!allowedFileExt.includes(ext)) {
      throw new CustomHttpException(
        `Invalid file type. Only ${allowedFileExt.join(', ')} are allowed`,
        HttpErrorCode.UNSUPPORTED_MIMETYPE
      );
    }

    return file;
  }
}
