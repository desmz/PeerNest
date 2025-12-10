import { z } from 'zod';

const zPort = z
  .string()
  .transform((port) => parseInt(port, 10))
  .pipe(z.number().int().min(1).max(65535));

const zBoolString = z.enum(['true', 'false']).transform((boolStr) => boolStr == 'true');

const NODE_ENV_VALUES = ['development', 'production', 'test'] as const;
export const BACKEND_STORAGE_PROVIDER_VALUES = ['s3'] as const;

export const envValidationSchema = z.object({
  // System-wide
  NODE_ENV: z.enum(NODE_ENV_VALUES),

  HOST: z.string().nonempty(),

  // Applications and Packages
  PORT: zPort,
  API_ORIGIN: z.url(),
  API_BASE_URL: z.url(),

  FRONTEND_PORT: zPort,
  PUBLIC_ORIGIN: z.url(),

  BRAND_NAME: z.string().nonempty(),
  ENABLE_GLOBAL_ERROR_LOGGING: zBoolString,

  // Database
  PG_DATABASE_PROTOCOL: z.string().nonempty(),
  PG_DATABASE_USER: z.string().nonempty(),
  PG_DATABASE_PASSWORD: z.string().nonempty(),
  PG_DATABASE_HOST: z.string().nonempty(),
  PG_DATABASE_PORT: zPort,
  PG_DATABASE_NAME: z.string().nonempty(),
  PG_DATABASE_URL: z.url(),
  PG_SSL_ENABLED: zBoolString,

  // Auth
  GENERAL_TOKEN_EXPIRES_IN: z.string().nonempty(), // e.g. "5m", "1h"
  SOCIAL_AUTH_PROVIDERS: z.string().transform((str) =>
    str
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
  ),

  BACKEND_GOOGLE_CLIENT_ID: z.string().nonempty(),
  BACKEND_GOOGLE_CLIENT_SECRET: z.string().nonempty(),
  BACKEND_GOOGLE_CALLBACK_URL: z.url(),

  AUTH_JWT_ACCESS_SECRET: z.string().nonempty(),
  AUTH_JWT_ACCESS_EXPIRES_IN: z.string().nonempty(), // e.g. "5m", "1h"

  // storage
  BACKEND_STORAGE_PROVIDER: z.string().nonempty(),
  BACKEND_STORAGE_PUBLIC_BUCKET: z.string().nonempty(),
  BACKEND_STORAGE_PRIVATE_BUCKET: z.string().nonempty(),

  BACKEND_STORAGE_S3_REGION: z.string().nonempty(),
  BACKEND_STORAGE_S3_ENDPOINT: z.url(),
  BACKEND_STORAGE_S3_ACCESS_KEY: z.string().nonempty(),
  BACKEND_STORAGE_S3_SECRET_KEY: z.string().nonempty(),
  BACKEND_STORAGE_S3_PUBLIC_BASE_URL: z.url(),
  BACKEND_STORAGE_S3_PRIVATE_BASE_URL: z.url(),

  // Mail Service Provider
  BACKEND_MAIL_HOST: z.string().nonempty(),
  BACKEND_MAIL_PORT: zPort,
  BACKEND_MAIL_SECURE: zBoolString,
  BACKEND_MAIL_SENDER: z.email(),
  BACKEND_MAIL_SENDER_NAME: z.string().optional(),
  BACKEND_MAIL_AUTH_USER: z.string().nonempty(),
  BACKEND_MAIL_AUTH_PASS: z.string().nonempty(),
});

export type TEnvObj = z.infer<typeof envValidationSchema>;
