import z from 'zod';

import { TApiMethod } from '../types';
import { banRequestIdSchema } from '../utils';

export const REJECT_BAN_REQUEST_METHOD: TApiMethod = 'post';

export const REJECT_BAN_REQUEST_URL = '/manage/ban-requests/{banRequestId}/reject';

export const rejectBanRequestParamsSchema = z.object({
  banRequestId: banRequestIdSchema(),
});

export type TRejectBanRequestParams = z.infer<typeof rejectBanRequestParamsSchema>;
