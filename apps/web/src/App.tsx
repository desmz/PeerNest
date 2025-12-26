import { Route, Routes, Navigate } from 'react-router';

import Layout from '@/components/layout/layout';
import SignInPage from '@/components/pages/auth/signInPage';
import Error404 from '@/components/pages/error/error404';
import HomePage from '@/components/pages/homePage';
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
      <Route path={APP_ROUTE.AUTH} element={<SignInPage />} />

      <Route element={<Layout />}>
        <Route path={APP_ROUTE.HOME} element={<HomePage />} />
      </Route>

      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;
