import { Inject, Provider } from '@nestjs/common';

import { storageConfig, TStorageConfig } from '@/configs/storage.config';

import { S3Storage } from './s3';

const StorageAdapterProvider = Symbol.for('ObjectStorage');

export const InjectStorageAdapter = (): ParameterDecorator => Inject(StorageAdapterProvider);

export const storageAdapterProvider: Provider = {
  inject: [storageConfig.KEY],
  provide: StorageAdapterProvider,
  useFactory: (config: TStorageConfig) => {
    switch (config.provider) {
      case 's3':
        return new S3Storage(config);
      default:
        throw new Error('Invalid storage provider');
    }
  },
};
