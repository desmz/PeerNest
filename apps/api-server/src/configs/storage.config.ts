import { Inject } from '@nestjs/common';
import { ConfigType, registerAs } from '@nestjs/config';
import { envObj } from '@peernest/config/dynamic';

export const storageConfig = registerAs('storage', () => ({
  provider: envObj.BACKEND_STORAGE_PROVIDER as 's3',
  publicBucket: envObj.BACKEND_STORAGE_PUBLIC_BUCKET || 'public',
  privateBucket: envObj.BACKEND_STORAGE_PRIVATE_BUCKET || 'private',
  publicBaseUrl: envObj.BACKEND_STORAGE_S3_PUBLIC_BASE_URL!,
  s3: {
    region: envObj.BACKEND_STORAGE_S3_REGION!,
    endpoint: envObj.BACKEND_STORAGE_S3_ENDPOINT,
    accessKey: envObj.BACKEND_STORAGE_S3_ACCESS_KEY!,
    secretKey: envObj.BACKEND_STORAGE_S3_SECRET_KEY!,
  },
}));

export const StorageConfig = () => Inject(storageConfig.KEY);

export type TStorageConfig = ConfigType<typeof storageConfig>;
