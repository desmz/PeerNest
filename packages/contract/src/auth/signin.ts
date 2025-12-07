import { z } from 'zod';

import { zNonEmpty, zString } from '../utils';

import { emailSchema } from './signup';

export const SIGN_IN = '/auth/signin';

export const signInFields = {
  email: 'Email ',
  password: 'Password',
} as const;

export const signInRoSchema = z.object({
  email: emailSchema,
  password: z.string(zString(signInFields.password)).nonempty(zNonEmpty(signInFields.password)),
});

export type TSignInRo = z.infer<typeof signInRoSchema>;
