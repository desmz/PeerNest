import z from 'zod';

import { TApiMethod } from '../types';
import { roleApplicationIdSchema, roleIdSchema, userIdSchema } from '../utils';

export const CHANGE_USER_ROLE_METHOD: TApiMethod = 'post';

export const CHANGE_USER_ROLE_URL = '/roles/change';

export const changeUserRoleFields = {
  targetUserId: 'Target User Id',
  newRoleId: 'New Role Id',
  roleApplicationId: 'Role Application Id',
} as const;

export const changeUserRoleRoSchema = z.object({
  targetUserId: userIdSchema(changeUserRoleFields.targetUserId),
  newRoleId: roleIdSchema(changeUserRoleFields.newRoleId),
  roleApplicationId: roleApplicationIdSchema().nullable(),
});

export type TChangeUserRoleRo = z.infer<typeof changeUserRoleRoSchema>;
