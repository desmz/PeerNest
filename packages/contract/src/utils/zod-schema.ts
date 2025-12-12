import z from 'zod';

import { zNonEmpty, zString } from './schema';

export const zNonEmptyString = (field: string): z.ZodString => {
  return z.string(zString(field)).nonempty(zNonEmpty(field));
};
