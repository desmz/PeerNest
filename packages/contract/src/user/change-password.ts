import z from 'zod';

import { passwordSchema } from '../auth';
import { zNonEmptyString } from '../utils';

export const CHANGE_PASSWORD = '/me/password';

export const changePasswordFields = {
  oldPassword: 'Old password',
  newPassword: 'Password',
  confirmPassword: 'Confirm Password',
} as const;

export const changePasswordRoSchema = z
  .object({
    oldPassword: zNonEmptyString(changePasswordFields.oldPassword),
    newPassword: passwordSchema,
    confirmPassword: zNonEmptyString(changePasswordFields.confirmPassword),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TChangePasswordRo = z.infer<typeof changePasswordRoSchema>;
