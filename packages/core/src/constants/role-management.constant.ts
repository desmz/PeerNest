import { UserRole } from './role.constant';

export const MIN_APPLY_ROLE_DESCRIPTION_LEN = 10;
export const MAX_APPLY_ROLE_DESCRIPTION_LEN = 500;

export enum RoleApplicationStatus {
  Pending = 'pending',
  Approved = 'approved',
  Rejected = 'rejected',
}

export const ALLOWED_APPLIED_ROLES = [UserRole.Admin, UserRole.Moderator, UserRole.Counselor];
