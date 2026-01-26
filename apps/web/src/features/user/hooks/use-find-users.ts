import { buildQueryParamsUrl, FIND_USERS_URL, type TFindUsersVo } from '@peernest/contract';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import api from '@/lib/api-client';

import { usersFilterAtom } from '../atoms/users-filter.atom';

export function useFindUsers() {
  const findUserQueryParams = useAtomValue(usersFilterAtom);
  return useQuery({
    queryKey: ['users', findUserQueryParams],
    queryFn: async (): Promise<TFindUsersVo> => {
      const url = buildQueryParamsUrl(FIND_USERS_URL, findUserQueryParams);
      const res = await api.get<TFindUsersVo>(url);
      return res.data;
    },
  });
}

export function useFindUsersForSpotlight() {
  return useQuery({
    queryKey: ['users', 'spotlight'],
    queryFn: async (): Promise<TFindUsersVo> => {
      const res = await api.get<TFindUsersVo>(FIND_USERS_URL);
      return res.data;
    },
  });
}
