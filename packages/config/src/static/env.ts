import { envValidationSchema, TEnvObj } from './validation';

const rawEnvObj: Record<string, string | undefined> = {
  // system-wide
  MODE: import.meta.env.VITE_MODE,

  HOST: import.meta.env.VITE_HOST,

  // applications and packages
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL,

  FRONTEND_PORT: import.meta.env.VITE_FRONTEND_PORT,
  PUBLIC_ORIGIN: import.meta.env.VITE_PUBLIC_ORIGIN,

  BRAND_NAME: import.meta.env.VITE_BRAND_NAME,
};

const parsedEnvObj = envValidationSchema.safeParse(rawEnvObj);

if (!parsedEnvObj.success) {
  console.error('❌ Failed to parse the env variables.');
  console.log(parsedEnvObj.error);
}

const envObj = parsedEnvObj.data as TEnvObj;

export { envObj };
