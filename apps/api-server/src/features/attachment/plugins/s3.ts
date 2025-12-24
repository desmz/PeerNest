/* eslint-disable @typescript-eslint/naming-convention */
import { posix } from 'path';
import { Readable } from 'stream';

import {
  GetObjectCommand,
  HeadObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { BadRequestException, Injectable } from '@nestjs/common';
import { HttpErrorCode, streamToBuffer } from '@peernest/core';
import fse from 'fs-extra';
import { Jimp } from 'jimp';
import ms from 'ms';

import { StorageConfig, type TStorageConfig } from '@/configs/storage.config';
import { CustomHttpException } from '@/custom.exception';
import { second } from '@/utils/second';

import StorageAdapter from './adapter';
import { TObjectMeta, TPresignParams, TPresignRes, TRespHeaders } from './types';

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
    if (ms(this.config.tokenExpireIn) >= ms('7d')) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 token expire in must be less than 7 days`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }
    if (ms(this.config.urlExpireIn) >= ms('7d')) {
      throw new CustomHttpException(
        `[${S3Storage.name}] | S3 token expire in must be less than 7 days`,
        HttpErrorCode.VALIDATION_ERROR
      );
    }

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

  async presigned(bucket: string, dir: string, params: TPresignParams): Promise<TPresignRes> {
    try {
      const { tokenExpireIn } = this.config;
      const uploadMethod = 'PUT';
      const { expiresIn, contentLength, contentType, fileName } = params;

      const path = posix.join(dir, fileName);

      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        ContentType: contentType,
        ContentLength: contentLength,
      });

      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: expiresIn ?? second(tokenExpireIn),
      });

      const requestHeaders = {
        'Content-Type': contentType,
        'Content-Length': contentLength,
      };

      return {
        url,
        path,
        uploadMethod,
        requestHeaders,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      throw new BadRequestException(`S3 presigned error${e?.message ? `: ${e.message}` : ''}`);
    }
  }

  async getObjectMeta(bucket: string, path: string): Promise<TObjectMeta> {
    const url = `/${bucket}/${path}`;

    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: path,
    });

    const {
      ContentLength: size,
      ContentType: s3Mimetype = 'application/octet-stream',
      ETag: hash,
    } = await this.s3Client.send(command);

    const mimetype = s3Mimetype || 'application/octet-stream';

    if (!size || !mimetype || !hash) {
      throw new BadRequestException('Invalid object meta');
    }

    if (!mimetype?.startsWith('image/')) {
      return {
        size,
        mimetype,
        url,
      };
    }

    const getObjectCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
    });

    const { Body } = await this.s3Client.send(getObjectCommand);
    if (!Body || !(Body instanceof Readable)) {
      throw new BadRequestException('Invalid image stream');
    }

    const stream = Body as Readable;

    try {
      const buffer = await streamToBuffer(stream);
      const image = await Jimp.fromBuffer(buffer, {
        'image/jpeg': { maxMemoryUsageInMB: 1024 }, // 1GB
      });
      const { height, width } = image.bitmap;

      return {
        url,
        size,
        mimetype,
        width,
        height,
      };
    } catch (error) {
      throw new BadRequestException(`Calculate image size failed: ${(error as Error).message}`);
    } finally {
      stream?.destroy();
    }
  }

  async getPreviewUrl(
    bucket: string,
    path: string,
    expiresIn: number = second(this.config.urlExpireIn),
    respHeaders?: TRespHeaders
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: path,
      ResponseContentDisposition: respHeaders?.['Content-Disposition'],
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresIn ?? second(this.config.tokenExpireIn),
    });
  }

  async uploadFileWithPath(
    bucket: string,
    path: string,
    filePath: string,
    metadata: Record<string, unknown>,
    isPublic?: boolean
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
      ACL: isPublic ? ObjectCannedACL.public_read : undefined,
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
    metadata?: Record<string, unknown>,
    isPublic?: boolean
  ): Promise<{ hash: string; path: string }> {
    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucket,
        Key: path,
        Body: stream,
        ContentType: metadata?.['Content-Type'] as string,
        ContentLength: metadata?.['Content-Length'] as number,
        ContentDisposition: metadata?.['Content-Disposition'] as string,
        ContentLanguage: metadata?.['Content-Language'] as string,
        ContentMD5: metadata?.['Content-MD5'] as string,
        ACL: isPublic ? ObjectCannedACL.public_read : undefined,
      },
    });

    return upload.done().then((res) => ({
      hash: res.ETag!,
      path,
    }));
  }
}
