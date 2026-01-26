import { UploadType } from '@peernest/core';
import { useState } from 'react';

import api from '@/lib/api-client';

import { TUploadResult, UploadError, UploadManager } from '../upload-manager';

type TUploadParams = {
  file: File;
  type: UploadType;
};

export default function useUploadAttachment() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const uploadFile = async (uploadParams: TUploadParams): Promise<TUploadResult> => {
    const uploadManager = new UploadManager(api);

    const { file, type } = uploadParams;

    try {
      setIsUploading(true);
      setUploadError(null);
      setAttachment(file);

      const res = await uploadManager.upload({
        file,
        name: file.name,
        size: file.size,
        mimetype: file.type,
        type,
      });

      return res;
    } catch (err) {
      setAttachment(null);
      if (err instanceof UploadError) {
        setUploadError(err.message);
        throw err;
      }

      const unknownError = new UploadError('Unexpected upload error', err);
      setUploadError(unknownError.message);
      throw unknownError;
    } finally {
      setIsUploading(false);
    }
  };

  const resetError = () => {
    setUploadError(null);
  };

  const resetAttachment = () => {
    setAttachment(null);
  };

  return {
    uploadFile,
    isUploading,
    attachment,
    uploadError,
    resetError,
    resetAttachment,
  };
}
