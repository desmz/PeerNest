import { envObj } from '@peernest/config/static';
import { NOTIFICATION_WEB_SOCKET_URL } from '@peernest/core';
import { useAtom } from 'jotai';
import React, { useEffect } from 'react';
import { io } from 'socket.io-client';

import Error404 from '@/components/pages/error/error404';
import { socketAtom } from '@/features/websocket/atoms/socket-atom';

import { currentUserAtom } from './atoms/current-user.atom';
import useCurrentUser from './hooks/use-current-user';

export function UserProvider({ children }: React.PropsWithChildren) {
  const [, setCurrentUser] = useAtom(currentUserAtom);
  const { data: currentUser, isLoading, error, isError } = useCurrentUser();
  const [, setSocket] = useAtom(socketAtom);

  useEffect(() => {
    if (isLoading || isError) {
      return;
    }

    const newSocket = io(`${envObj.API_ORIGIN}${NOTIFICATION_WEB_SOCKET_URL}`, {
      transports: ['websocket'],
      withCredentials: true,
    });
    // const newSocket = io(NOTIFICATION_WEB_SOCKET_URL, {
    //   transports: ['websocket'],
    //   withCredentials: true,
    // });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('ws connected');
    });

    return () => {
      console.log('ws disconnected');
      newSocket.disconnect();
    };
  }, [isError, isLoading, setSocket]);

  useEffect(() => {
    if (currentUser) {
      setCurrentUser(currentUser);
    }
  }, [currentUser, setCurrentUser, isLoading]);

  if (isLoading) return <>Loading</>;

  // @ts-expect-error TS7053
  if (isError && error?.['response']?.status === 404) {
    return <Error404 />;
  }

  if (error) {
    return <div>Error</div>;
  }

  return children;
}
