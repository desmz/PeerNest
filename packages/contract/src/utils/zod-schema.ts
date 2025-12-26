import { isEmptyObject } from '@peernest/core';
import z, { ZodObject, ZodRawShape } from 'zod';

import { zInt, zMax, zMin, zNonEmpty, zNumber, zPositive, zString } from './schema';

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

export const zMinMaxString = (field: string, min: number, max: number): z.ZodString => {
  return z.string(zString(field)).min(min, zMin(field, min)).max(max, zMax(field, max));
};

export const zPosNumber = (field: string): z.ZodNumber => {
  return z.number(zNumber(field)).positive(zPositive(field));
};

export const zPosInt = (field: string): z.ZodInt => {
  return z.int(zInt(field)).positive(zPositive(field));
};
