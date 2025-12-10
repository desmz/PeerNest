import { z } from 'zod';

import { zNonEmpty, zString } from '../utils';

import { emailSchema } from './signup';

export const SIGN_IN = '/auth/signin';

export const signInFields = {
  email: 'Email ',
  password: 'Password',
} as const;

export function loosePasswordSchema(field: string) {
  return z.string(zString(field)).nonempty(zNonEmpty(field));
}

export const signInRoSchema = z.object({
  email: emailSchema,
  password: loosePasswordSchema(signInFields.password),
});

export type TSignInRo = z.infer<typeof signInRoSchema>;
