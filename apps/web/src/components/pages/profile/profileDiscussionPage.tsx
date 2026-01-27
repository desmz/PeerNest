import { Tabs } from '@mantine/core';

import ProfileDiscussionComments from './profileDiscussionComments';
import ProfileDiscussionLiked from './profileDiscussionLikes';
import ProfileDiscussionPosts from './profileDiscussionPosts';

export default function ProfileDiscussionPage() {
  return (
    <Tabs defaultValue='posts' bg={'white'} w={'100%'} pt={'md'}>
      <Tabs.List>
        <Tabs.Tab value='posts'>Posts</Tabs.Tab>
        <Tabs.Tab value='likes'>Likes</Tabs.Tab>
        <Tabs.Tab value='comments'>Comments</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='posts'>
        <ProfileDiscussionPosts />
      </Tabs.Panel>

      <Tabs.Panel value='likes'>
        <ProfileDiscussionLiked />
      </Tabs.Panel>

      <Tabs.Panel value='comments'>
        <ProfileDiscussionComments />
      </Tabs.Panel>
    </Tabs>
  );
}
