import { z } from 'zod';

import { emailSchema, passwordSchema } from './signup';

export const SIGN_IN = '/auth/signin';

export const signInFields = {
  email: 'Email ',
  password: 'Password',
} as const;

export const signInRoSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export type TSignInRo = z.infer<typeof signInRoSchema>;
