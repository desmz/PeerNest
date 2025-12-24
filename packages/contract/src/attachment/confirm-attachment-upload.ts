import { UploadType } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { attachmentIdSchema } from '../utils';

export const CONFIRM_ATTACHMENT_UPLOAD_METHOD: TApiMethod = 'put';

export const CONFIRM_ATTACHMENT_UPLOAD_URL = '/attachments/{attachmentId}/confirm';

export const confirmAttachmentUploadParamsSchema = z.object({
  attachmentId: attachmentIdSchema(),
});

export type TConfirmAttachmentUploadParams = z.infer<typeof confirmAttachmentUploadParamsSchema>;

export const confirmAttachmentUploadQueryParamsSchema = z.object({
  type: z.enum(UploadType),
});

export type TConfirmAttachmentUploadQueryParams = z.infer<
  typeof confirmAttachmentUploadQueryParamsSchema
>;

export const confirmAttachmentUploadVoSchema = z.object({
  previewUrl: z.url(),
  attachmentId: attachmentIdSchema(),
  attachmentName: z.string().nonempty(),
  attachmentSize: z.string().nonempty(),
  attachmentMimetype: z.string().nonempty(),
  attachmentHeight: z.string().nonempty().nullable(),
  attachmentWidth: z.string().nonempty().nullable(),
});

export type TConfirmAttachmentUploadVo = z.infer<typeof confirmAttachmentUploadVoSchema>;
