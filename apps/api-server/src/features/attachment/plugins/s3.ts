import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';
import { HttpErrorCode } from '@peernest/core';
import fse from 'fs-extra';

import { StorageConfig, type TStorageConfig } from '@/configs/storage.config';
import { CustomHttpException } from '@/custom.exception';

import StorageAdapter from './adapter';

@Injectable()
export class S3Storage implements StorageAdapter {
  static readonly NAME = 'S3_STORAGE';
  private s3Client: S3Client;

  constructor(@StorageConfig() private readonly config: TStorageConfig) {
    this.checkConfig();
    const { region, endpoint, accessKey, secretKey } = this.config.s3;

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });
  }

  private checkConfig() {
    if (!this.config.s3.region) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 region is required`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
    if (!this.config.s3.endpoint) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 endpoint is required`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
    if (!this.config.s3.accessKey) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 access key is required`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
    if (!this.config.s3.secretKey) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 secret key is required`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
  }

  async uploadFileWithPath(
    bucket: string,
    path: string,
    filePath: string,
    metadata: Record<string, unknown>
  ): Promise<{ hash: string; path: string }> {
    const readStream = fse.createReadStream(filePath);
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: readStream,
      ContentType: metadata['Content-Type'] as string,
      ContentLength: metadata['Content-Length'] as number,
      ContentDisposition: metadata['Content-Disposition'] as string,
      ContentLanguage: metadata['Content-Language'] as string,
      ContentMD5: metadata['Content-MD5'] as string,
    });

    return this.s3Client
      .send(command)
      .then((res) => ({
        hash: res.ETag!,
        path,
      }))
      .finally(() => {
        readStream.removeAllListeners();
        readStream.destroy();
      });
  }

  async uploadFile(
    bucket: string,
    path: string,
    stream: Buffer | ReadableStream | string,
    metadata?: Record<string, unknown>
  ): Promise<{ hash: string; path: string }> {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: path,
      Body: stream,
      ContentType: metadata?.['Content-Type'] as string,
      ContentLength: metadata?.['Content-Length'] as number,
      ContentDisposition: metadata?.['Content-Disposition'] as string,
      ContentLanguage: metadata?.['Content-Language'] as string,
      ContentMD5: metadata?.['Content-MD5'] as string,
    });

    return this.s3Client.send(command).then((res) => ({
      hash: res.ETag!,
      path,
    }));
  }
}
