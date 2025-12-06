import { type TMeVo } from '@peernest/contract';
import { TSelectableUser } from '@peernest/db';

export function pickUserMe(user: TSelectableUser): TMeVo {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
  };
}
