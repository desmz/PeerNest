import z from 'zod';

import { attachmentIdSchema } from '../utils';

export const DELETE_ATTACHMENT_URL = '/attachments/{attachmentId}';

export const deleteAttachmentParamsSchema = z.object({
  attachmentId: attachmentIdSchema(),
});

export type TDeleteAttachmentParams = z.infer<typeof deleteAttachmentParamsSchema>;
