import z from 'zod';

import { TApiMethod } from '../types';
import { attachmentIdSchema } from '../utils';

export const DELETE_ATTACHMENT_METHOD: TApiMethod = 'delete';

export const DELETE_ATTACHMENT_URL = '/attachments/{attachmentId}';

export const deleteAttachmentParamsSchema = z.object({
  attachmentId: attachmentIdSchema(),
});

export type TDeleteAttachmentParams = z.infer<typeof deleteAttachmentParamsSchema>;
