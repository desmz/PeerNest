import path from 'path';

import dotenv from 'dotenv';
import dotEnvExpand from 'dotenv-expand';

import { envValidationSchema, TEnvObj } from './validation';

const envPath = path.resolve(process.cwd(), '..', '..', '.env');
dotEnvExpand.expand(dotenv.config({ path: envPath }));

const rawEnvObj = {
  // system-wide
  NODE_ENV: process.env.NODE_ENV,

  HOST: process.env.HOST,

  // applications and packages
  PORT: process.env.PORT,
  API_ORIGIN: process.env.API_ORIGIN,
  API_BASE_URL: process.env.API_BASE_URL,

  FRONTEND_PORT: process.env.FRONTEND_PORT,
  PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN,

  BRAND_NAME: process.env.BRAND_NAME,
  ENABLE_GLOBAL_ERROR_LOGGING: process.env.ENABLE_GLOBAL_ERROR_LOGGING,

  // database
  PG_DATABASE_PROTOCOL: process.env.PG_DATABASE_PROTOCOL,
  PG_DATABASE_USER: process.env.PG_DATABASE_USER,
  PG_DATABASE_PASSWORD: process.env.PG_DATABASE_PASSWORD,
  PG_DATABASE_HOST: process.env.PG_DATABASE_HOST,
  PG_DATABASE_PORT: process.env.PG_DATABASE_PORT,
  PG_DATABASE_NAME: process.env.PG_DATABASE_NAME,
  PG_DATABASE_URL: process.env.PG_DATABASE_URL,
  PG_SSL_ENABLED: process.env.PG_SSL_ENABLED,

  // auth
  SOCIAL_AUTH_PROVIDERS: process.env.SOCIAL_AUTH_PROVIDERS,

  BACKEND_GOOGLE_CLIENT_ID: process.env.BACKEND_GOOGLE_CLIENT_ID,
  BACKEND_GOOGLE_CLIENT_SECRET: process.env.BACKEND_GOOGLE_CLIENT_SECRET,
  BACKEND_GOOGLE_CALLBACK_URL: process.env.BACKEND_GOOGLE_CALLBACK_URL,

  AUTH_JWT_ACCESS_SECRET: process.env.AUTH_JWT_ACCESS_SECRET,
  AUTH_JWT_ACCESS_EXPIRES_IN: process.env.AUTH_JWT_ACCESS_EXPIRES_IN,

  // storage
  BACKEND_STORAGE_PROVIDER: process.env.BACKEND_STORAGE_PROVIDER,
  BACKEND_STORAGE_PUBLIC_BUCKET: process.env.BACKEND_STORAGE_PUBLIC_BUCKET,
  BACKEND_STORAGE_PRIVATE_BUCKET: process.env.BACKEND_STORAGE_PRIVATE_BUCKET,

  BACKEND_STORAGE_S3_REGION: process.env.BACKEND_STORAGE_S3_REGION,
  BACKEND_STORAGE_S3_ENDPOINT: process.env.BACKEND_STORAGE_S3_ENDPOINT,
  BACKEND_STORAGE_S3_ACCESS_KEY: process.env.BACKEND_STORAGE_S3_ACCESS_KEY,
  BACKEND_STORAGE_S3_SECRET_KEY: process.env.BACKEND_STORAGE_S3_SECRET_KEY,
  BACKEND_STORAGE_S3_PUBLIC_BASE_URL: process.env.BACKEND_STORAGE_S3_PUBLIC_BASE_URL,
  BACKEND_STORAGE_S3_PRIVATE_BASE_URL: process.env.BACKEND_STORAGE_S3_PRIVATE_BASE_URL,

  // mail service provider
  BACKEND_MAIL_HOST: process.env.BACKEND_MAIL_HOST,
  BACKEND_MAIL_PORT: process.env.BACKEND_MAIL_PORT,
  BACKEND_MAIL_SECURE: process.env.BACKEND_MAIL_SECURE,
  BACKEND_MAIL_SENDER: process.env.BACKEND_MAIL_SENDER,
  BACKEND_MAIL_SENDER_NAME: process.env.BACKEND_MAIL_SENDER_NAME,
  BACKEND_MAIL_AUTH_USER: process.env.BACKEND_MAIL_AUTH_USER,
  BACKEND_MAIL_AUTH_PASS: process.env.BACKEND_MAIL_AUTH_PASS,
};

const parsedEnvObj = envValidationSchema.safeParse(rawEnvObj);

if (!parsedEnvObj.success) {
  console.error('❌ Failed to parse the env variables.');
  console.log(parsedEnvObj.error);
}

const envObj = parsedEnvObj.data as TEnvObj;

export { envObj };
