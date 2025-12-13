import { isEmptyObject } from '@peernest/core';
import z, { ZodObject, ZodRawShape } from 'zod';

import { zNonEmpty, zString } from './schema';

export const zNonEmptyString = (field: string): z.ZodString => {
  return z.string(zString(field)).nonempty(zNonEmpty(field));
};

export const zNonEmptyObject = <T extends ZodRawShape>(objectSchema: ZodObject<T>) =>
  objectSchema.superRefine((obj, ctx) => {
    // const keys = Object.keys(obj).filter((key) => Boolean(obj[key as keyof typeof obj]));
    // keys.length === 0

    if (isEmptyObject(obj)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Object cannot be empty',
      });
    }
  });
