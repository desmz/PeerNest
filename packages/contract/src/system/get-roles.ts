import z from 'zod';

import { TApiMethod } from '../types';

export const GET_ROLES_METHOD: TApiMethod = 'get';

export const GET_ROLES_URL = '/sys/roles';

export const roleSchema = z.object({
  roleId: z.string(),
  roleName: z.string(),
  roleRank: z.int().positive(),
});

export const getRolesVoSchema = z.array(roleSchema);

export type TGetRolesVo = z.infer<typeof getRolesVoSchema>;
