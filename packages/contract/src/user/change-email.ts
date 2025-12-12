import z from 'zod';

import { zEmail, zNonEmptyString } from '../utils';

export const CHANGE_EMAIL = '/me/email/change';

export const changeEmailFields = {
  newEmail: 'Email',
  code: 'Code',
} as const;

export const changeEmailRoSchema = z.object({
  newEmail: z.email(zEmail(changeEmailFields.newEmail)),
  code: zNonEmptyString(changeEmailFields.newEmail),
});

export type TChangeEmailRo = z.infer<typeof changeEmailRoSchema>;
