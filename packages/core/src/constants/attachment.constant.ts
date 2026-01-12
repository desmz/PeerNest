import { UploadType } from './storage.constant';

export enum AttachmentStatus {
  Pending = 'pending',
  Ready = 'ready',
  Deleted = 'deleted',
}

export type TAttachmentPolicy = {
  maxSize: number;
  allowedMimeTypes: string[];
  requiredDimensions?: boolean;
  maxWidth?: number;
  maxHeight?: number;
};

export const AttachmentPolicies: Record<UploadType, TAttachmentPolicy> = {
  [UploadType.Avatar]: {
    maxSize: 3 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  },
  [UploadType.Discussion]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png'],
  },
  [UploadType.RoleApplication]: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['application/pdf'],
  },
};
