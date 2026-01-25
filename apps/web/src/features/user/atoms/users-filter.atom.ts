import type { TFindUsersQueryParams } from '@peernest/contract';

import { atom } from 'jotai';

export const usersFilterAtom = atom<TFindUsersQueryParams>({
  q: undefined,
  interestIds: undefined,
  goalIds: undefined,
  limit: undefined,
  offset: undefined,
});
