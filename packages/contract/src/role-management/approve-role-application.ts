import z from 'zod';

import { TApiMethod } from '../types';
import { roleApplicationIdSchema } from '../utils';

export const APPROVE_ROLE_APPLICATION_METHOD: TApiMethod = 'post';

export const APPROVE_ROLE_APPLICATION_URL = 'roles/applications/{roleApplicationId}/approve';

export const approveRoleApplicationParamsSchema = z.object({
  roleApplicationId: roleApplicationIdSchema(),
});

export type TApproveRoleApplicationParams = z.infer<typeof approveRoleApplicationParamsSchema>;
