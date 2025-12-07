import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { displayNameSchema, emailSchema } from '../auth/signup';

export const ME = '/users/me';

export const userIdSchema = z.string().startsWith(IdPrefix.User);

export const meVoSchema = z.object({
  displayName: displayNameSchema,
  role: z.string().nonempty(),
  email: emailSchema,
  avatarUrl: z.string().nonempty(),
  lastSignedTime: z.date(),
});

export type TMeVo = z.infer<typeof meVoSchema>;
