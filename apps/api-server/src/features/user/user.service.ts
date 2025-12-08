import { join } from 'path';

import { Injectable } from '@nestjs/common';
import { generateUuid, HttpErrorCode, UploadType } from '@peernest/core';
import jdenticon, { toPng } from 'jdenticon';

import { CustomHttpException } from '@/custom.exception';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';

@Injectable()
export class UserService {
  constructor(
    // private readonly kyselyService: KyselyService,
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter
  ) {}

  async testing() {
    const config = {
      lightness: {
        color: [0.4, 0.8],
        grayscale: [0.3, 0.9],
      },
      saturation: {
        color: 0.5,
        grayscale: 0.0,
      },
      backColor: '#0000',
    };

    jdenticon.configure(config);
    const id = generateUuid();
    const avatarSize = 256;
    const mimetype = 'image/png';
    const avatarBuffer = toPng(id, avatarSize);

    console.log('avatar is generated');

    const path = `${join(StorageAdapter.getDir(UploadType.Avatar), id)}.png`;
    const bucket = StorageAdapter.getBucket(UploadType.Avatar);

    console.log({ path, bucket });

    const { hash } = await this.storageAdapter.uploadFile(bucket, path, avatarBuffer, {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': mimetype,
    });

    if (!hash) {
      throw new CustomHttpException(
        'Fail to upload avatar, cannot get avatar size',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}
