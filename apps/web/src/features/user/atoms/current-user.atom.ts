import { TMeVo } from '@peernest/contract';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const currentUserAtom = atomWithStorage<TMeVo | null>('currentUser', null);

export const userAtom = atom(
  (get) => {
    const currentUser = get(currentUserAtom);
    return currentUser ?? null;
  },
  (get, set, newUser: TMeVo) => {
    const currentUser = get(currentUserAtom);
    if (currentUser) {
      set(currentUserAtom, {
        ...currentUser,
        user: newUser,
      });
    }
  }
);
