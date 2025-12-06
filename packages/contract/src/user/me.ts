import { IdPrefix } from '@peernest/core';
import z from 'zod';

import { displayNameSchema, emailSchema } from '../auth/signup';

export const ME = '/users/me';

export const userIdSchema = z.string().startsWith(IdPrefix.User);

export const meVoSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
  displayName: displayNameSchema,
});

export type TMeVo = z.infer<typeof meVoSchema>;
