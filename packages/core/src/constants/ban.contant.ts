import { IdPrefix } from '../utils';

export const MIN_BAN_REQUEST_REASON_LEN = 10;
export const MAX_BAN_REQUEST_REASON_LEN = 500;

export enum BanRequestStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export enum BanRequestProofResourceType {
  Discussion = 'discussion',
  Comment = 'comment',
}

export const DISCUSSION_REFERENCE_REGEX = new RegExp(
  `\\[\\[(${IdPrefix.Discussion}-[a-z0-9-]+)\\]\\]`,
  'g'
);
export const COMMENT_REFERENCE_REGEX = new RegExp(
  `\\[\\[(${IdPrefix.Comment}-[a-z0-9-]+)\\]\\]`,
  'g'
);
