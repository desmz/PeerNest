import { UserRole } from '@peernest/core';
import { ClsStore } from 'nestjs-cls';

export interface IClsStore extends ClsStore {
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}
