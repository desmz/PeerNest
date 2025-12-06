import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import useCurrentUser from '@/features/user/hooks/use-current-user';
import { APP_ROUTE } from '@/lib/app-route';

export function useRedirectIfAuthenticated() {
  const { data, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (data) {
      navigate(APP_ROUTE.HOME);
    }
  }, [isLoading, data, navigate]);
}
