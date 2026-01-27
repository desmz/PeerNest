import { Card, Flex, Group, SegmentedControl, Skeleton, Stack, Text, Title } from '@mantine/core';
import {
  buildQueryParamsUrl,
  GET_WELLNESS_OVERVIEW_URL,
  TGetWellnessOverviewQueryParams,
  TGetWellnessOverviewVo,
} from '@peernest/contract';
import { MAX_CHECK_IN_MOOD_RATING, WELLNESS_OVERVIEW_DEFAULT_DAYS } from '@peernest/core';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import api from '@/lib/api-client';

import WellnessOverviewTrendIndicator from './wellnessOverviewTrendIndicator';

async function getWellnessOverview(queryParams: TGetWellnessOverviewQueryParams) {
  const url = buildQueryParamsUrl(GET_WELLNESS_OVERVIEW_URL, queryParams);
  return api.get<TGetWellnessOverviewVo>(url);
}

const overviewDaysOptions = [
  { label: 'vs last week', value: '7' },
  { label: 'vs last 30 days', value: '30' },
];

export default function WellnessOverviewSection() {
  const [overviewDays, setOverviewDays] = useState<number>(WELLNESS_OVERVIEW_DEFAULT_DAYS);

  const { data: overviewData, isLoading } = useQuery({
    queryKey: ['wellness', 'overview', overviewDays],
    queryFn: async () => {
      const { data } = await getWellnessOverview({ days: overviewDays });
      return data;
    },
  });

  const minutesToHourMinuteString = (givenMinutes: number) => {
    const hours = Math.floor(givenMinutes / 60);
    const minutes = Math.floor(givenMinutes % 60);
    return `${hours}h ${minutes}`;
  };

  return (
    <Stack gap={12}>
      <Title order={3}>Health Stats</Title>
      <SegmentedControl
        value={String(overviewDays)}
        onChange={(value) => setOverviewDays(Number(value))}
        data={overviewDaysOptions}
        w={'fit-content'}
        bd={'2 solid gray.3'}
        disabled={isLoading}
      />
      <Group gap={16} mt={8}>
        <Card withBorder p={12} radius={'md'} flex={1} h={'100%'}>
          <Text size='sm' fw={700} c='dimmed' mb='md'>
            Mood
          </Text>
          {overviewData ? (
            <Flex align={'flex-end'}>
              <Text fz={32} fw={700}>
                {overviewData?.moodRating.average.toFixed(2)}
              </Text>
              <WellnessOverviewTrendIndicator
                trend={overviewData?.moodRating.trend}
                changePercentage={overviewData?.moodRating.changePercentage.toFixed(2)}
                maxValue={MAX_CHECK_IN_MOOD_RATING}
              />
            </Flex>
          ) : (
            <Skeleton height={'100%'} width={'100%'} />
          )}
        </Card>
        <Card withBorder p={12} radius={'md'} flex={1} h={'100%'}>
          <Text size='sm' fw={700} c='dimmed' mb='md'>
            Time asleep
          </Text>
          {overviewData ? (
            <Flex align={'flex-end'}>
              <Text fz={32} fw={700}>
                {minutesToHourMinuteString(overviewData?.sleepTime.average)}
              </Text>
              <WellnessOverviewTrendIndicator
                trend={overviewData?.sleepTime.trend}
                changePercentage={overviewData?.sleepTime.changePercentage.toFixed(2)}
                maxValue={MAX_CHECK_IN_MOOD_RATING}
              />
            </Flex>
          ) : (
            <Skeleton height={'100%'} width={'100%'} />
          )}
        </Card>
        <Card withBorder p={12} radius={'md'} flex={1} h={'100%'}>
          <Text size='sm' fw={700} c='dimmed' mb='md'>
            Sleep quality
          </Text>
          {overviewData ? (
            <Flex align={'flex-end'}>
              <Text fz={32} fw={700}>
                {overviewData?.sleepQualityRating.average.toFixed(2)}
              </Text>
              <WellnessOverviewTrendIndicator
                trend={overviewData?.sleepQualityRating.trend}
                changePercentage={overviewData?.sleepQualityRating.changePercentage.toFixed(2)}
                maxValue={MAX_CHECK_IN_MOOD_RATING}
              />
            </Flex>
          ) : (
            <Skeleton height={'100%'} width={'100%'} />
          )}
        </Card>
      </Group>
    </Stack>
  );
}
