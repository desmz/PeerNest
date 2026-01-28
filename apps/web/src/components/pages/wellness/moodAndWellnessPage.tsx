import { Flex, Stack } from '@mantine/core';

import WellnessCalendarSection from './wellnessCalendarSection';
import WellnessOverviewSection from './wellnessOverviewSection';
import WellnessSummarySection from './wellnessSummarySection';
import WellnessTrendSection from './wellnessTrendSection';

export default function MoodAndWellnessPage() {
  return (
    <Flex py={24} gap={24} mih={'100vh'} px={8}>
      <Stack w={'60%'} gap={24}>
        <WellnessOverviewSection />
        <WellnessTrendSection />
      </Stack>
      <Stack w={'40%'} gap={24}>
        <WellnessCalendarSection />
        <WellnessSummarySection />
      </Stack>
    </Flex>
  );
}
