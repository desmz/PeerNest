import { Route, Routes, Navigate } from 'react-router';

import Layout from '@/components/layout/layout';
import LoginPage from '@/components/pages/auth/signInPage';
import Error404 from '@/components/pages/error/error404';
import HomePage from '@/components/pages/homePage';
import MyProfilePage from '@/components/pages/user/myProfilePage';
import PeerMatchingPage from '@/components/pages/user/peerMatchingPage';
import PeerProfilePreviewPage from '@/components/pages/user/peerProfilePreviewPage';
import { APP_ROUTE } from '@/lib/app-route';

export function App() {
  // const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  // console.log(timezone);

  // const now = new Date();
  // const local = new Date(now).toLocaleString('en-US', {
  //   timeZone: timezone,
  // });

  // console.log({ now: now.toUTCString(), local });

  return (
    <Routes>
      <Route index element={<Navigate to={APP_ROUTE.HOME} />} />
      <Route path={APP_ROUTE.AUTH} element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path={APP_ROUTE.HOME} element={<HomePage />} />
        <Route path={APP_ROUTE.USER} element={<PeerMatchingPage />} />
        <Route path={APP_ROUTE.USER_ME} element={<MyProfilePage />} />
        <Route path={`${APP_ROUTE.USER}/:userId`} element={<PeerProfilePreviewPage />} />
      </Route>

      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;
