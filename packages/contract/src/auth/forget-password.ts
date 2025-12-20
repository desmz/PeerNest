import z from 'zod';

import { loosePasswordSchema } from './signin';

export const FORGET_PASSWORD_URL = '/auth/forget-password';

export const forgetPasswordFields = {
  email: 'Email',
} as const;

export const forgetPasswordRoSchema = z.object({
  email: loosePasswordSchema(forgetPasswordFields.email),
});

export type TForgetPasswordRo = z.infer<typeof forgetPasswordRoSchema>;
