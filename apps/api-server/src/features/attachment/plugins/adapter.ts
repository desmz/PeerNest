import { HttpErrorCode, UploadType } from '@peernest/core';

import { storageConfig } from '@/configs/storage.config';
import { CustomHttpException } from '@/custom.exception';

import { TObjectMeta, TPresignParams, TPresignRes } from './types';

export default abstract class StorageAdapter {
  private static readonly storageAdapterName = 'STORAGE_ADAPTER';

  static readonly getBucket = (type: UploadType): string => {
    switch (type) {
      case UploadType.Avatar:
      case UploadType.Discussion:
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
      case UploadType.Discussion:
        return 'discussion';
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
   * generate presigned url
   * @param bucket bucket name
   * @param dir storage dir
   * @param params presigned params, limit presigned url upload file
   * @returns presigned url and upload params
   */
  abstract presigned(bucket: string, dir: string, params: TPresignParams): Promise<TPresignRes>;

  /**
   * get object meta
   * @param bucket bucket name
   * @param path path name
   * @returns object meta
   */
  abstract getObjectMeta(bucket: string, path: string): Promise<TObjectMeta>;

  /**
   * get preview url
   * @param bucket bucket name
   * @param path path name
   * @param respHeaders response headers, example: { 'Content-Type': 'images/png' }
   */
  abstract getPreviewUrl(
    bucket: string,
    path: string,
    expiresIn?: number,
    respHeaders?: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }
  ): Promise<string>;

  /**
   * Upload file with the file path.
   * @param bucket bucket name
   * @param path path name
   * @param filePath file path
   * @param metadata metadata of the object
   * @param isPublic object public accessibility flag
   */
  abstract uploadFileWithPath(
    bucket: string,
    path: string,
    filePath: string,
    metadata: Record<string, unknown>,
    isPublic?: boolean
  ): Promise<{ hash: string; path: string }>;

  /**
   * Upload file with file stream
   * @param bucket bucket name
   * @param path path name
   * @param stream file stream or string
   * @param metadata metadata of the object
   * @param isPublic object public accessibility flag
   */
  abstract uploadFile(
    bucket: string,
    path: string,
    stream: Buffer | ReadableStream | string,
    metadata?: Record<string, unknown>,
    isPublic?: boolean
  ): Promise<{ hash: string; path: string }>;
}
