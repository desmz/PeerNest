import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  confirmAttachmentUploadParamsSchema,
  confirmAttachmentUploadQueryParamsSchema,
  deleteAttachmentParamsSchema,
  type TDeleteAttachmentParams,
  type TConfirmAttachmentUploadParams,
  type TConfirmAttachmentUploadQueryParams,
  type TConfirmAttachmentUploadVo,
  type TCreateAttachmentRo,
  type TCreateAttachmentVo,
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { AttachmentService } from './attachment.service';

@Controller('api/attachments')
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createAttachment(
    @Body() createAttachmentRo: TCreateAttachmentRo
  ): Promise<TCreateAttachmentVo> {
    return this.attachmentService.createAttachment(createAttachmentRo);
  }

  @Put(':attachmentId/confirm')
  @HttpCode(HttpStatus.OK)
  async confirmAttachmentUpload(
    @Param(new ZodValidationPipe(confirmAttachmentUploadParamsSchema))
    confirmAttachmentUploadParams: TConfirmAttachmentUploadParams,
    @Query(new ZodValidationPipe(confirmAttachmentUploadQueryParamsSchema))
    confirmAttachmentUploadQueryParams: TConfirmAttachmentUploadQueryParams
  ): Promise<TConfirmAttachmentUploadVo> {
    return this.attachmentService.confirmAttachmentUpload(
      confirmAttachmentUploadParams,
      confirmAttachmentUploadQueryParams
    );
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAttachment(
    @Param(new ZodValidationPipe(deleteAttachmentParamsSchema))
    deleteAttachmentParams: TDeleteAttachmentParams
  ): Promise<void> {
    await this.attachmentService.deleteAttachment(deleteAttachmentParams);
  }
}
