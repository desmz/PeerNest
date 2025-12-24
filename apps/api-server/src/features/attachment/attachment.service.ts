import { Injectable } from '@nestjs/common';
import {
  TConfirmAttachmentUploadParams,
  TConfirmAttachmentUploadQueryParams,
  TConfirmAttachmentUploadVo,
  TCreateAttachmentRo,
  TCreateAttachmentVo,
  TDeleteAttachmentParams,
} from '@peernest/contract';
import {
  AttachmentPolicies,
  AttachmentStatus,
  generateAttachmentId,
  HttpErrorCode,
} from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { AttachmentRepository } from '@/persistence/repos/attachment';
import { IClsStore } from '@/types/cls';

import StorageAdapter from './plugins/adapter';
import { InjectStorageAdapter } from './plugins/storage-provider';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly clsService: ClsService<IClsStore>,

    private readonly attachmentRepository: AttachmentRepository
  ) {}

  async createAttachment(createAttachmentRo: TCreateAttachmentRo): Promise<TCreateAttachmentVo> {
    const { mimetype, name, size, type, height, width } = createAttachmentRo;

    const { maxSize, allowedMimeTypes, requiredDimensions } = AttachmentPolicies[type];

    const userId = this.clsService.get('user.id');

    if (size > maxSize) {
      throw new CustomHttpException(
        `${name} cannot larger than ${maxSize / (1024 * 1024)}MB`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

    if (!allowedMimeTypes.includes(mimetype)) {
      throw new CustomHttpException(
        `Invalid file type. Only ${allowedMimeTypes.join(', ')} are allowed`,
        HttpErrorCode.UNSUPPORTED_MIMETYPE
      );
    }

    if (requiredDimensions) {
      if (!width || !height) {
        throw new CustomHttpException(
          'Image dimensions are required',
          HttpErrorCode.VALIDATION_ERROR
        );
      }
    }

    const attachmentId = generateAttachmentId();
    const dir = StorageAdapter.getDir(type);
    const bucket = StorageAdapter.getBucket(type);
    const res = await this.storageAdapter.presigned(bucket, dir, {
      contentType: mimetype,
      contentLength: size,
      fileName: attachmentId,
    });

    const now = new Date();
    await this.attachmentRepository.createAttachment({
      attachmentId: attachmentId,
      attachmentPath: res.path,
      attachmentName: attachmentId,
      attachmentStatus: AttachmentStatus.Pending,
      attachmentSize: size,
      attachmentMimetype: mimetype,
      attachmentOwnerId: userId,
      attachmentCreatedTime: now,
    });

    const resp = {
      ...res,
      attachmentId,
    };

    return resp;
  }

  async confirmAttachmentUpload(
    confirmAttachmentUploadParams: TConfirmAttachmentUploadParams,
    confirmAttachmentUploadQueryParams: TConfirmAttachmentUploadQueryParams
  ): Promise<TConfirmAttachmentUploadVo> {
    const { attachmentId } = confirmAttachmentUploadParams;
    const { type } = confirmAttachmentUploadQueryParams;

    const attachment = await this.attachmentRepository.findAttachmentById(attachmentId);

    if (!attachment) {
      throw new CustomHttpException(
        `Attachment ${attachmentId} is not found`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (attachment.attachmentStatus !== AttachmentStatus.Pending) {
      throw new CustomHttpException(
        `Attachment ${attachmentId} is not in ${AttachmentStatus.Pending} status`,
        HttpErrorCode.UNPROCESSABLE_ENTITY
      );
    }

    const bucket = StorageAdapter.getBucket(type);
    const res = await this.storageAdapter.getObjectMeta(bucket, attachment.attachmentPath);

    const now = new Date();
    const updatedAttachment = await this.attachmentRepository.updateAttachmentById(
      {
        attachmentStatus: AttachmentStatus.Ready,
        attachmentWidth: res.width ?? null,
        attachmentHeight: res.height ?? null,
        attachmentUpdatedTime: now,
      },
      attachmentId
    );

    const previewUrl = await this.storageAdapter.getPreviewUrl(
      bucket,
      updatedAttachment.attachmentPath,
      undefined,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      { 'Content-Type': updatedAttachment.attachmentMimetype }
    );

    return {
      previewUrl: previewUrl,
      attachmentId: updatedAttachment.attachmentId,
      attachmentName: updatedAttachment.attachmentName,
      attachmentSize: updatedAttachment.attachmentSize,
      attachmentMimetype: updatedAttachment.attachmentMimetype,
      attachmentHeight: updatedAttachment.attachmentHeight
        ? updatedAttachment.attachmentHeight
        : null,
      attachmentWidth: updatedAttachment.attachmentWidth ? updatedAttachment.attachmentWidth : null,
    };
  }

  async deleteAttachment(deleteAttachmentParams: TDeleteAttachmentParams): Promise<void> {
    const { attachmentId } = deleteAttachmentParams;

    const userId = this.clsService.get('user.id');

    const attachment = await this.attachmentRepository.findAttachmentById(attachmentId);

    if (!attachment) {
      throw new CustomHttpException(
        `Attachment ${attachmentId} is not found`,
        HttpErrorCode.NOT_FOUND
      );
    }

    if (attachment.attachmentOwnerId !== userId) {
      throw new CustomHttpException(
        `Only owner of the attachment can delete this attachment`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    if (attachment.attachmentStatus !== AttachmentStatus.Pending) {
      throw new CustomHttpException(
        `Attachment ${attachmentId} is not in ${AttachmentStatus.Pending} status`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    await this.attachmentRepository.updateAttachmentById(
      {
        attachmentStatus: AttachmentStatus.Deleted,
        attachmentDeletedTime: now,
      },
      attachmentId
    );
  }
}
