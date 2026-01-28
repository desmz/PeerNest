import {
  CREATE_ATTACHMENT_URL,
  CONFIRM_ATTACHMENT_UPLOAD_URL,
  TCreateAttachmentRo,
  TCreateAttachmentVo,
  TConfirmAttachmentUploadVo,
  buildQueryParamsUrl,
  urlBuilder,
} from '@peernest/contract';
import { UploadType } from '@peernest/core';
import axios, { AxiosInstance } from 'axios';

export type TUploadResult = {
  attachmentId: string;
  previewUrl?: string;
};

export class UploadError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message);
    this.name = 'UploadError';
  }
}
export class UploadManager {
  constructor(private readonly api: AxiosInstance) {}

  private async createAttachment(payload: TCreateAttachmentRo) {
    try {
      const res = await this.api.post<TCreateAttachmentVo>(CREATE_ATTACHMENT_URL, payload);

      return res.data;
    } catch (err) {
      throw new UploadError('Failed to create attachment', err);
    }
  }

  private async uploadToStorage(
    file: File | Buffer,
    uploadUrl: string,
    method: string,
    headers: Record<string, unknown>
  ) {
    try {
      delete headers['Content-Length'];

      await axios(uploadUrl, {
        method,
        data: file,
        headers: headers as Record<string, string>,
      });
    } catch (err) {
      throw new UploadError('Failed to upload file to storage', err);
    }
  }

  private async confirmUpload(attachmentId: string, type: UploadType) {
    try {
      let url = urlBuilder(CONFIRM_ATTACHMENT_UPLOAD_URL, { attachmentId });
      url = buildQueryParamsUrl(url, { type });

      const res = await this.api.put<TConfirmAttachmentUploadVo>(url);

      return res.data;
    } catch (err) {
      throw new UploadError('Failed to confirm attachment upload', err);
    }
  }

  async upload(params: {
    file: File | Buffer;
    name: string;
    size: number;
    mimetype: string;
    type: UploadType;
    width?: number | null;
    height?: number | null;
  }): Promise<TUploadResult> {
    try {
      const attachment = await this.createAttachment({
        type: params.type,
        name: params.name,
        size: params.size,
        mimetype: params.mimetype,
        width: params.width,
        height: params.height,
      });

      await this.uploadToStorage(
        params.file,
        attachment.url,
        attachment.uploadMethod,
        attachment.requestHeaders
      );

      const confirmed = await this.confirmUpload(attachment.attachmentId, params.type);

      return {
        attachmentId: confirmed.attachmentId,
        previewUrl: confirmed.previewUrl,
      };
    } catch (err) {
      if (err instanceof UploadError) throw err;
      throw new UploadError('Unexpected upload error', err);
    }
  }
}
