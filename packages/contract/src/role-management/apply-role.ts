import { MAX_APPLY_ROLE_DESCRIPTION_LEN, MIN_APPLY_ROLE_DESCRIPTION_LEN } from '@peernest/core';
import z from 'zod';

import { TApiMethod } from '../types';
import { attachmentIdSchema, roleIdSchema, zMinMaxString } from '../utils';

export const APPLY_ROLE_METHOD: TApiMethod = 'post';

export const APPLY_ROLE_URL = '/roles/applications';

export const applyRoleFields = {
  roleId: 'Role Id',
  description: 'Description',
  attachmentId: 'Attachment Id',
} as const;

export const applyRoleRoSchema = z.object({
  roleId: roleIdSchema(),
  description: zMinMaxString(
    applyRoleFields.description,
    MIN_APPLY_ROLE_DESCRIPTION_LEN,
    MAX_APPLY_ROLE_DESCRIPTION_LEN
  ),
  attachmentId: attachmentIdSchema().nullable(),
});

export type TApplyRoleRo = z.infer<typeof applyRoleRoSchema>;
