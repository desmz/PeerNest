import z from 'zod';

import { zNonEmpty, zString } from '../utils';

import { passwordSchema } from './signup';

export const RESET_PASSWORD = '/auth/reset-password';

export const resetPasswordFields = {
  code: 'Code',
  newPassword: 'Password',
  confirmPassword: 'Confirm Password',
} as const;

export const resetPasswordRoSchema = z
  .object({
    code: z.string(zString(resetPasswordFields.code)).nonempty(zNonEmpty(resetPasswordFields.code)),
    newPassword: passwordSchema,
    confirmPassword: z
      .string(zString(resetPasswordFields.confirmPassword))
      .nonempty(zNonEmpty(resetPasswordFields.confirmPassword)),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TResetPasswordRo = z.infer<typeof resetPasswordRoSchema>;
