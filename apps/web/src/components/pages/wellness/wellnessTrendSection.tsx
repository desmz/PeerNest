import { Paper, Stack, Title } from '@mantine/core';
import {
  buildQueryParamsUrl,
  GET_WELLNESS_TRENDS_URL,
  TGetWellnessTrendsQueryParams,
  TGetWellnessTrendsVo,
} from '@peernest/contract';

import api from '@/lib/api-client';

import WellnessTrendHeartRateChart from './wellnessTrendHeartRateChart';
import WellnessTrendAverageMoodChart from './wellnessTrendMoodRatingChart';
import WellnessTrendSleepQualityRatingChart from './wellnessTrendSleepQualityRatingChart';
import WellnessTrendStepCountChart from './wellnessTrendStepCountChart';
import WellnessTrendWeightChart from './wellnessTrendWeightChart';

export async function getWellnessTrends(queryParams: TGetWellnessTrendsQueryParams) {
  const url = buildQueryParamsUrl(GET_WELLNESS_TRENDS_URL, queryParams);
  return api.get<TGetWellnessTrendsVo>(url);
}

export const wellnessTrendOptions = [
  { label: '30d', value: '30' },
  { label: '7d', value: '7' },
];

export default function WellnessTrendSection() {
  return (
    <Paper bdrs={'md'}>
      <Stack p={'lg'}>
        <Title order={3}>Health Trends</Title>
        <WellnessTrendAverageMoodChart />
        <WellnessTrendSleepQualityRatingChart />
        <WellnessTrendHeartRateChart />
        <WellnessTrendStepCountChart />
        <WellnessTrendWeightChart />
      </Stack>
    </Paper>
  );
}
