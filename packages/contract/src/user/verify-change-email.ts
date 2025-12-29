import z from 'zod';

import { TApiMethod } from '../types';
import { zEmail } from '../utils';

export const VERIFY_CHANGE_EMAIL_METHOD: TApiMethod = 'patch';

export const VERIFY_CHANGE_EMAIL_URL = '/me/email/verify-change';

export const verifyChangeEmailFields = {
  newEmail: 'Email',
} as const;

export const verifyChangeEmailRoSchema = z.object({
  newEmail: z.email(zEmail(verifyChangeEmailFields.newEmail)),
});

export type TVerifyChangeEmailRo = z.infer<typeof verifyChangeEmailRoSchema>;
