import z from 'zod';

import { TApiMethod } from '../types';
import { roleApplicationIdSchema } from '../utils';

export const REJECT_ROLE_APPLICATION_METHOD: TApiMethod = 'post';

export const REJECT_ROLE_APPLICATION_URL = 'roles/applications/{roleApplicationId}/reject';

export const rejectRoleApplicationParamsSchema = z.object({
  roleApplicationId: roleApplicationIdSchema(),
});

export type TRejectRoleApplicationParams = z.infer<typeof rejectRoleApplicationParamsSchema>;
