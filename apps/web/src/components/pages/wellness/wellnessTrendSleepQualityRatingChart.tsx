import { LineChart } from '@mantine/charts';
import { Box, Center, Flex, Loader, Select, Stack, Text } from '@mantine/core';
import { TGetWellnessTrendsQueryParams } from '@peernest/contract';
import {
  dayjs,
  MAX_CHECK_IN_SLEEP_QUALITY_RATING,
  MIN_CHECK_IN_SLEEP_QUALITY_RATING,
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
    sleepRating: d.value,
  }));
}

export default function WellnessTrendSleepQualityRatingChart() {
  const defaultDays = wellnessTrendsDefaultDays[WellnessTrendsMetric.SleepQualityRating];
  const [wellnessTrendSleepQualityRatingObj, setWellnessTrendSleepQualityRatingObj] =
    useState<TGetWellnessTrendsQueryParams>({
      metrics: [WellnessTrendsMetric.SleepQualityRating],
      days: defaultDays,
    });

  const { data: wellnessTrendsData, isLoading } = useQuery({
    queryKey: ['wellness', 'trends', wellnessTrendSleepQualityRatingObj],
    queryFn: async () => {
      const { data } = await getWellnessTrends(wellnessTrendSleepQualityRatingObj);
      return data;
    },
  });

  const chartData =
    wellnessTrendsData?.sleepQualityRating &&
    buildChartData(wellnessTrendsData?.sleepQualityRating?.data);
  const step = wellnessTrendSleepQualityRatingObj.days === defaultDays ? 3 : 1;

  const xTicks = chartData?.map((d) => d.date).filter((_, index) => index % step === 0) ?? [];
  const formatXAxis = (value: string) => dayjs(value).format('D');

  return (
    <Stack gap={0}>
      <Flex justify={'space-between'}>
        <Text fw={600}>Sleep Quality</Text>
        <Select
          data={wellnessTrendOptions}
          value={String(wellnessTrendSleepQualityRatingObj.days)}
          onChange={(value) =>
            setWellnessTrendSleepQualityRatingObj({
              ...wellnessTrendSleepQualityRatingObj,
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
        {wellnessTrendsData?.sleepQualityRating ? (
          <LineChart
            h={'100%'}
            data={chartData!}
            dataKey='date'
            series={[
              {
                name: 'sleepRating',
                label: 'Sleep Quality',
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
              domain: [MIN_CHECK_IN_SLEEP_QUALITY_RATING - 1, MAX_CHECK_IN_SLEEP_QUALITY_RATING],
              ticks: Array.from({ length: MAX_CHECK_IN_SLEEP_QUALITY_RATING + 1 }).map(
                (_v, i) => i
              ),
            }}
            xAxisProps={{
              ticks: xTicks,
              tickFormatter: formatXAxis,
            }}
            gridProps={{ yAxisId: 'left' }}
            strokeWidth={2}
            tooltipProps={{
              formatter: (value) => [`${value}`, 'Sleep Rating'],
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
