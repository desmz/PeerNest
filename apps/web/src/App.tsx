import { Route, Routes, Navigate } from 'react-router';

import Layout from '@/components/layout/layout';
import AchievementPage from '@/components/pages/achievement/achievementPage';
import LoginPage from '@/components/pages/auth/signInPage';
import BanPage from '@/components/pages/ban/banPage';
import CreateDiscussionPage from '@/components/pages/discussion/createDiscussionPage';
import DiscussionForumPage from '@/components/pages/discussion/discussionForumPage';
import Error404 from '@/components/pages/error/error404';
import HomePage from '@/components/pages/homePage';
import ManagePage from '@/components/pages/manage/managePage';
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
        <Route path={APP_ROUTE.MANAGE} element={<ManagePage />} />
        <Route path={APP_ROUTE.ACHIEVEMENT} element={<AchievementPage />} />
        <Route path={APP_ROUTE.DISCUSSION} element={<DiscussionForumPage />} />
        <Route path={APP_ROUTE.CREATE_DISCUSSION} element={<CreateDiscussionPage />} />
      </Route>

      <Route path={APP_ROUTE.BAN} element={<BanPage />} />
      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;
