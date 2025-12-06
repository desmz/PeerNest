import { z } from 'zod';

const zPort = z
  .string()
  .transform((port) => parseInt(port, 10))
  .pipe(z.number().int().min(1).max(65535));

// const zBoolString = z.enum(['true', 'false']).transform((boolStr) => boolStr == 'true');

const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
export const BACKEND_STORAGE_PROVIDER_VALUES = ['s3'] as const;

export const envValidationSchema = z.object({
  // System-wide
  MODE: z.enum(NODE_ENV_VALUES),

  HOST: z.string().nonempty(),

  // Applications and Packages
  API_BASE_URL: z.url(),

  FRONTEND_PORT: zPort,
  PUBLIC_ORIGIN: z.url(),

  BRAND_NAME: z.string().nonempty(),
});

export type TEnvObj = z.infer<typeof envValidationSchema>;
