import { LineChart } from '@mantine/charts';
import { Box, Center, Flex, Loader, Select, Stack, Text } from '@mantine/core';
import { TGetWellnessTrendsQueryParams } from '@peernest/contract';
import {
  dayjs,
  MAX_CHECK_IN_MOOD_RATING,
  MIN_CHECK_IN_MOOD_RATING,
  wellnessTrendsDefaultDays,
  WellnessTrendsMetric,
} from '@peernest/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { getWellnessTrends, wellnessTrendOptions } from './wellnessTrendSection';

function buildChartData(data: { date: string; value: number | null }[]) {
  return data.map((d) => ({
    date: d.date,
    mood: d.value,
  }));
}

export default function WellnessTrendMoodRatingChart() {
  const defaultDays = wellnessTrendsDefaultDays[WellnessTrendsMetric.MoodRating];
  const [wellnessTrendMoodRatingObj, setWellnessTrendMoodRatingObj] =
    useState<TGetWellnessTrendsQueryParams>({
      metrics: [WellnessTrendsMetric.MoodRating],
      days: defaultDays,
    });

  const { data: wellnessTrendsData, isLoading } = useQuery({
    queryKey: ['wellness', 'trends', wellnessTrendMoodRatingObj],
    queryFn: async () => {
      const { data } = await getWellnessTrends(wellnessTrendMoodRatingObj);
      return data;
    },
  });

  const chartData =
    wellnessTrendsData?.moodRating && buildChartData(wellnessTrendsData?.moodRating?.data);
  const step = wellnessTrendMoodRatingObj.days === defaultDays ? 3 : 1;

  const xTicks = chartData?.map((d) => d.date).filter((_, index) => index % step === 0) ?? [];
  const formatXAxis = (value: string) => dayjs(value).format('D');

  return (
    <Stack gap={0}>
      <Flex justify={'space-between'}>
        <Text fw={600}>Average Mood</Text>
        <Select
          data={wellnessTrendOptions}
          value={String(wellnessTrendMoodRatingObj.days)}
          onChange={(value) =>
            setWellnessTrendMoodRatingObj({
              ...wellnessTrendMoodRatingObj,
              days: Number(value),
            })
          }
          rightSection={<IconChevronDown size={16} />}
          maw={72}
          size='sm'
          variant='outline'
          disabled={isLoading}
        />
      </Flex>
      <Box pr={8} h={280}>
        {wellnessTrendsData?.moodRating ? (
          <LineChart
            h={'100%'}
            data={chartData!}
            dataKey='date'
            series={[
              {
                name: 'mood',
                label: 'Average Mood',
                color: 'blue.5',
              },
            ]}
            curveType='linear'
            connectNulls={false}
            withDots
            withXAxis
            withYAxis
            tickLine='xy'
            gridAxis='xy'
            xAxisLabel='Date'
            yAxisProps={{
              domain: [MIN_CHECK_IN_MOOD_RATING - 1, MAX_CHECK_IN_MOOD_RATING],
              ticks: [0, 2, 4, 6, 8, 10],
            }}
            xAxisProps={{
              ticks: xTicks,
              tickFormatter: formatXAxis,
            }}
            gridProps={{ yAxisId: 'left' }}
            strokeWidth={2}
            tooltipProps={{
              formatter: (value) => [`${value}`, 'Mood'],
              labelFormatter: (label) => dayjs(label).format('DD MMM YYYY'),
            }}
            valueFormatter={(v) => (v === null ? '—' : String(v))}
          />
        ) : (
          <Center h={'100%'}>
            <Loader color='blue' />
          </Center>
        )}
      </Box>
    </Stack>
  );
}
