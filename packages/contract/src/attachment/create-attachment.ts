import { UploadType } from '@peernest/core';
import z from 'zod';

import { attachmentIdSchema } from '../utils';

export const CREATE_ATTACHMENT_URL = '/attachments';

export const createAttachmentRoSchema = z.object({
  type: z.enum(UploadType),
  name: z.string().nonempty(),
  size: z.int().positive(),
  mimetype: z.string().nonempty(),
  width: z.number().nullish(),
  height: z.number().nullish(),
});

export type TCreateAttachmentRo = z.infer<typeof createAttachmentRoSchema>;

export const createAttachmentVoSchema = z.object({
  attachmentId: attachmentIdSchema(),
  url: z.url(),
  uploadMethod: z.string().nonempty(),
  path: z.string().nonempty(),
  requestHeaders: z.record(z.string(), z.unknown()),
});

export type TCreateAttachmentVo = z.infer<typeof createAttachmentVoSchema>;
