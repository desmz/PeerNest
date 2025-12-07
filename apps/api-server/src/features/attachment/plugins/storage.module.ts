import { Module } from '@nestjs/common';

import { storageAdapterProvider } from './storage-provider';

@Module({
  providers: [storageAdapterProvider],
  exports: [storageAdapterProvider],
})
export class StorageModule {}
