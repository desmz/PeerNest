import { HttpErrorCode, UploadType } from '@peernest/core';

import { storageConfig } from '@/configs/storage.config';
import { CustomHttpException } from '@/custom.exception';

export default abstract class StorageAdapter {
  private static readonly storageAdapterName = 'STORAGE_ADAPTER';

  static readonly getBucket = (type: UploadType): string => {
    switch (type) {
      case UploadType.Avatar:
        return storageConfig().publicBucket;
      default:
        throw new CustomHttpException(
          `[${StorageAdapter.storageAdapterName}] | Invalid upload type ${type}`,
          HttpErrorCode.VALIDATION_ERROR
        );
    }
  };

  static readonly getDir = (type: UploadType): string => {
    switch (type) {
      case UploadType.Avatar:
        return 'avatar';
      default:
        throw new CustomHttpException(
          `[${StorageAdapter.storageAdapterName}] | Invalid upload type ${type}`,
          HttpErrorCode.VALIDATION_ERROR
        );
    }
  };

  static readonly isPublicBucket = (bucket: string) => {
    return bucket === storageConfig().publicBucket;
  };

  static readonly isPrivateBucket = (bucket: string) => {
    return bucket === storageConfig().privateBucket;
  };

  /**
   * Upload file with the file path.
   * @param bucket bucket name
   * @param path path name
   * @param filePath file path
   * @param metadata metadata of the object
   */
  abstract uploadFileWithPath(
    bucket: string,
    path: string,
    filePath: string,
    metadata: Record<string, unknown>
  ): Promise<{ hash: string; path: string }>;

  /**
   * Upload file with file stream
   * @param bucket bucket name
   * @param path path name
   * @param stream file stream or string
   * @param metadata metadata of the object
   */
  abstract uploadFile(
    bucket: string,
    path: string,
    stream: Buffer | ReadableStream | string,
    metadata?: Record<string, unknown>
  ): Promise<{ hash: string; path: string }>;
}
