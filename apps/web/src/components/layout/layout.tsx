import { Outlet } from 'react-router';

import { UserProvider } from '@/features/user/user-provider';

export default function Layout() {
  return (
    <UserProvider>
      <Outlet />
    </UserProvider>
  );
}
