import { z } from 'zod';

/**
 * Extracts the field and form errors from a zod safeParse error object.
 * @param zodError  The error object returned by zod's safeParse method.
 * @returns An object containing the field and form errors.
 */
export function formatZodError<TInput>(zodError: z.ZodError<TInput>) {
  const { fieldErrors, formErrors } = z.flattenError(zodError);

  let errors;
  if (fieldErrors) {
    errors = { ...fieldErrors };
  }
  if (formErrors.length > 0) {
    errors = { ...errors, formErrors };
  }

  return errors;
}
