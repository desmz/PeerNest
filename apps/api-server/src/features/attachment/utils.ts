import { storageConfig } from '@/configs/storage.config';

export function getFullStorageUrl(path: string) {
  return storageConfig().publicBaseUrl + '/' + path;
}

// todo: update the storage path once setting up the storage endpoint
// export const getFullStorageUrl = (bucket: string, path: string) => {
//   const { storagePrefix } = baseConfig();
//   const { provider } = storageConfig();
//   if (provider === 'local') {
//     return baseConfig().storagePrefix + join('/', LocalStorage.readPath, bucket, path);
//   }
//   return storagePrefix + join('/', bucket, path);
// };
