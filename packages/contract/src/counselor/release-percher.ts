import z from 'zod';

import { TApiMethod } from '../types';
import { userIdSchema } from '../utils';

export const RELEASE_PERCHER_METHOD: TApiMethod = 'post';

export const RELEASE_PERCHER_URL = '/counselors/me/perchers/{percherId}/release';

export const releasePercherParamFields = {
  percherId: 'Percher Id Param',
} as const;

export const releasePercherParamsSchema = z.object({
  percherId: userIdSchema(releasePercherParamFields.percherId),
});

export type TReleasePercherParams = z.infer<typeof releasePercherParamsSchema>;
