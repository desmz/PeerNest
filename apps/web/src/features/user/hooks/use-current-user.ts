import { useQuery } from '@tanstack/react-query';

import { getMyInfo } from '../services/user-service';

export default function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return (await getMyInfo()).data;
    },
  });
}
