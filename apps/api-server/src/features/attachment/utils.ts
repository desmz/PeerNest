import { UploadType } from '@peernest/core';

import { storageConfig } from '@/configs/storage.config';

import StorageAdapter from './plugins/adapter';

export function getFullStorageUrl(path: string) {
  return storageConfig().publicBaseUrl + '/' + path;
}

export async function getAttachmentPreviewUrl(
  storageAdapter: StorageAdapter,
  uploadType: UploadType,
  attachmentPath: string | null,
  attachmentMimetype: string | null
) {
  if (!attachmentPath) {
    return null;
  }

  const bucket = StorageAdapter.getBucket(uploadType);

  const respHeaders: Record<string, string> = {};

  if (attachmentMimetype) {
    respHeaders['Content-Type'] = attachmentMimetype;
  }

  const attachmentUrl = await storageAdapter.getPreviewUrl(
    bucket,
    attachmentPath,
    undefined,
    respHeaders
  );

  return attachmentUrl;
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
