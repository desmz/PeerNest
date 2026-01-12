import z from 'zod';

import { displayNameSchema, emailSchema } from '../auth/signup';
import { TApiMethod } from '../types';

export const ME_METHOD: TApiMethod = 'get';

export const ME_URL = '/me';

export const meVoSchema = z.object({
  displayName: displayNameSchema,
  role: z.string().nonempty(),
  roleRank: z.int(),
  email: emailSchema,
  avatarUrl: z.string().nonempty(),
  lastSignedTime: z.date(),
});

export type TMeVo = z.infer<typeof meVoSchema>;
