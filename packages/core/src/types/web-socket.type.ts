import { UserRole } from '../constants';

export type TSocketRoleRoom = `role:${UserRole.Admin}` | `role:${UserRole.Moderator}`;

export type TSocketRecipients = {
  userIds?: string[];
  roles?: UserRole[];
};
