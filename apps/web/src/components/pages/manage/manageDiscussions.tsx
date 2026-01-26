import { Tabs } from '@mantine/core';

import ManageDiscussionsArchived from './manageDiscussionsArchived';
import ManageDiscussionsReport from './manageDiscussionsReport';

export default function ProfileDiscussionPage() {
  return (
    <Tabs defaultValue='reports' bg={'white'} w={'100%'}>
      <Tabs.List>
        <Tabs.Tab value='reports' py={'md'}>
          Reports
        </Tabs.Tab>
        <Tabs.Tab value='archived' py={'md'}>
          Archived
        </Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value='reports'>
        <ManageDiscussionsReport />
      </Tabs.Panel>

      <Tabs.Panel value='archived'>
        <ManageDiscussionsArchived />
      </Tabs.Panel>
    </Tabs>
  );
}
