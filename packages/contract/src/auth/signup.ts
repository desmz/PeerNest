import {
  MAX_DISPLAY_NAME_LEN,
  MIN_DISPLAY_NAME_LEN,
  MIN_PASSWORD_LEN,
  PERMITTED_USERNAMES,
} from '@peernest/core';
import { z } from 'zod';

import { zEmail, zMax, zMin, zNonEmpty, zString } from '../utils/schema';

export const SIGN_UP = '/auth/signup';

export const signUpFields = {
  email: 'Email ',
  displayName: 'Display Name',
  password: 'Password',
  confirmPassword: 'Confirm Password',
} as const;

export const emailSchema = z.email(zEmail(signUpFields.email));

export const displayNameSchema = z
  .string(zString(signUpFields.displayName))
  .min(MIN_DISPLAY_NAME_LEN, zMin(signUpFields.displayName, MIN_DISPLAY_NAME_LEN))
  .max(MAX_DISPLAY_NAME_LEN, zMax(signUpFields.displayName, MAX_DISPLAY_NAME_LEN))
  .refine(
    (name) =>
      !PERMITTED_USERNAMES.some((permittedUsername: string) => name.includes(permittedUsername)),
    {
      message: `${signUpFields.displayName} cannot contains words related to the Discord system names`,
    }
  );

export const passwordSchema = z
  .string(zString(signUpFields.password))
  .min(MIN_PASSWORD_LEN, zMin(signUpFields.password, MIN_PASSWORD_LEN))
  .regex(/[A-Z]/, {
    message: `${signUpFields.password} must contain at least one uppercase letter `,
  })
  .regex(/[a-z]/, {
    message: `${signUpFields.password} must contain at least one lowercase letter`,
  })
  .regex(/[0-9]/, {
    message: `${signUpFields.password} must contain at least one number`,
  })
  .regex(/[!@#$%^&*()_\-+={[}\]|:;"'<,>.?]/, {
    message: `${signUpFields.password} must contain at least one special character`,
  });

export const signUpRoSchema = z
  .object({
    email: emailSchema,
    displayName: displayNameSchema,
    password: passwordSchema,
    confirmPassword: z
      .string(zString(signUpFields.confirmPassword))
      .nonempty(zNonEmpty(signUpFields.confirmPassword)),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TSignUpRo = z.infer<typeof signUpRoSchema>;
