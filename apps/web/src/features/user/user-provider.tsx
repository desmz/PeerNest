import { useAtom } from 'jotai';
import React, { useEffect } from 'react';

import { currentUserAtom } from './atoms/current-user.atom';
import useCurrentUser from './hooks/use-current-user';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentUser] = useAtom(currentUserAtom);
  const { data: currentUser, isLoading, error, isError } = useCurrentUser();

  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser);
    }
  }, [currentUser, setCurrentUser, isLoading]);

  if (isLoading) return <>Loading</>;

  // @ts-expect-error TS7053
  if (isError && error?.['response']?.status === 404) {
    return <div>Not found page</div>;
  }

  if (error) {
    return <div>Error</div>;
  }

  return children;
}
