import { Route, Routes, Navigate } from 'react-router';

import Layout from '@/components/layout/layout';
import AchievementPage from '@/components/pages/achievement/achievementPage';
import LoginPage from '@/components/pages/auth/signInPage';
import BanPage from '@/components/pages/ban/banPage';
import DiscussionForumPage from '@/components/pages/discussion/discussionForumPage';
import PostDetailPage from '@/components/pages/discussion/postDetailPage';
import Error404 from '@/components/pages/error/error404';
import HomePage from '@/components/pages/homePage';
import ManagePage from '@/components/pages/manage/managePage';
import ProfileDiscussionPage from '@/components/pages/profile/profileDiscussionPage';
// import ResourcePage from '@/components/pages/playground/resources';
import MyProfileEditingPage from '@/components/pages/user/myProfileEditing';
import MyProfilePage from '@/components/pages/user/myProfilePage';
import PeerMatchingPage from '@/components/pages/user/peerMatchingPage';
import PeerProfilePreviewPage from '@/components/pages/user/peerProfilePreviewPage';
import MoodAndWellnessPage from '@/components/pages/wellness/moodAndWellnessPage';
import { APP_ROUTE } from '@/lib/app-route';

export function App() {
  return (
    <Routes>
      <Route index element={<Navigate to={APP_ROUTE.HOME} />} />
      <Route path={APP_ROUTE.AUTH} element={<LoginPage />} />

      <Route element={<Layout />}>
        <Route path={APP_ROUTE.HOME} element={<HomePage />} />
        <Route path={APP_ROUTE.USER} element={<PeerMatchingPage />} />

        {/* My profile */}
        <Route path={APP_ROUTE.USER_ME} element={<MyProfilePage />} />
        <Route path={`${APP_ROUTE.USER_ME}/edit`} element={<MyProfileEditingPage />} />

        {/* Peer profile preview */}
        <Route path={`${APP_ROUTE.USER}/:userId`} element={<PeerProfilePreviewPage />} />

        {/* <Route path='resources' element={<ResourcePage />} /> */}
        <Route path={APP_ROUTE.MANAGE} element={<ManagePage />} />

        <Route path={APP_ROUTE.ACHIEVEMENT} element={<AchievementPage />} />
        <Route path={APP_ROUTE.DISCUSSION} element={<DiscussionForumPage />} />
        <Route path={APP_ROUTE.PROFILE_DISCUSSION_POST} element={<ProfileDiscussionPage />} />
        <Route path={`${APP_ROUTE.DISCUSSION}/:discussionId`} element={<PostDetailPage />} />

        {/* Mood and wellness page */}
        <Route path={APP_ROUTE.WELLNESS} element={<MoodAndWellnessPage />} />
      </Route>

      <Route path={APP_ROUTE.BAN} element={<BanPage />} />
      <Route path='*' element={<Error404 />} />
    </Routes>
  );
}

export default App;
