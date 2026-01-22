import { UserRole } from '@peernest/core';
import { useAtom } from 'jotai';
import { useNavigate } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import { APP_ROUTE } from '@/lib/app-route';

import CounselorMangePage from './counselorManagePage';
import ResourcePage from './resources';

export default function ManagePage() {
  const navigate = useNavigate();
  const [currentUser] = useAtom(currentUserAtom);

  const role = currentUser?.role;
  if (role === UserRole.Counselor) {
    return <CounselorMangePage />;
  } else if (role === UserRole.Admin) {
    return <ResourcePage />;
  } else {
    navigate(APP_ROUTE.HOME, { replace: true });
    return null;
  }
}
