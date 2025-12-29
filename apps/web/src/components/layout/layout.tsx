import { Outlet } from 'react-router';

import { UserProvider } from '@/features/user/user-provider';

import GlobalAppShell from './globalAppShell';

export default function Layout() {
  return (
    <UserProvider>
      <GlobalAppShell>
        <Outlet />
      </GlobalAppShell>
    </UserProvider>
  );
}
