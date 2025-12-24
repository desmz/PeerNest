import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { AttachmentPolicies, HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import { type TFileValidationOptions } from '@/types/file-validation-pipe';

@Injectable()
export class AvatarValidationPipe implements PipeTransform {
  constructor(private readonly options: TFileValidationOptions) {}

  transform(file: Express.Multer.File, _metadata: ArgumentMetadata) {
    const { fieldName: providedFieldName } = this.options;

    const { maxSize, allowedMimeTypes } = AttachmentPolicies.avatar;

    const fieldName = providedFieldName || 'file';
    if (!file) {
      throw new CustomHttpException(`${fieldName} is required`, HttpErrorCode.VALIDATION_ERROR);
    }

    const fileSize = file.size;
    if (fileSize > maxSize) {
      throw new CustomHttpException(
        `${fieldName} cannot larger than ${maxSize / (1024 * 1024)}MB`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    const mimetype = file.mimetype;
    if (!allowedMimeTypes.includes(mimetype)) {
      throw new CustomHttpException(
        `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed`,
        HttpErrorCode.UNSUPPORTED_MIMETYPE
      );
    }

    return file;
  }
}
