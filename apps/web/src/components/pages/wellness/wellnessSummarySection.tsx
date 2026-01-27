import { Paper, Stack } from '@mantine/core';

import WellnessSummaryFactors from './wellnessSummaryFactors';
import WellnessSummaryMoods from './wellnessSummaryMoods';
import WellnessSummarySymptoms from './wellnessSummarySymptoms';

export default function WellnessSummarySection() {
  return (
    <Paper>
      <Stack p={'lg'}>
        <WellnessSummaryMoods />
        <WellnessSummarySymptoms />
        <WellnessSummaryFactors />
      </Stack>
    </Paper>
  );
}
