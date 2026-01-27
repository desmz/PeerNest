import { LineChart } from '@mantine/charts';
import { Box, Center, Flex, Loader, Select, Stack, Text } from '@mantine/core';
import { TGetWellnessTrendsQueryParams } from '@peernest/contract';
import {
  dayjs,
  generateSequence,
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
    stepCount: d.value,
  }));
}

export default function WellnessTrendStepCountChart() {
  const defaultDays = wellnessTrendsDefaultDays[WellnessTrendsMetric.StepCount];
  const [wellnessTrendStepCountObj, setWellnessTrendStepCountObj] =
    useState<TGetWellnessTrendsQueryParams>({
      metrics: [WellnessTrendsMetric.StepCount],
      days: defaultDays,
    });

  const { data: wellnessTrendsData, isLoading } = useQuery({
    queryKey: ['wellness', 'trends', wellnessTrendStepCountObj],
    queryFn: async () => {
      const { data } = await getWellnessTrends(wellnessTrendStepCountObj);
      return data;
    },
  });

  const chartData =
    wellnessTrendsData?.stepCount && buildChartData(wellnessTrendsData?.stepCount?.data);
  const step = wellnessTrendStepCountObj.days === defaultDays ? 3 : 1;

  const xTicks = chartData?.map((d) => d.date).filter((_, index) => index % step === 0) ?? [];
  const formatXAxis = (value: string) => dayjs(value).format('D');

  const offset = 10;
  const sequenceStep = 20;
  const MIN_STEP_COUNT_Y_AXIS = 0;
  const MAX_STEP_COUNT_Y_AXIS = 20_000;
  const minYAxis = Math.max(
    MIN_STEP_COUNT_Y_AXIS,
    (wellnessTrendsData?.stepCount?.min ?? MIN_STEP_COUNT_Y_AXIS) - offset
  );
  const maxYAxis = Math.min(
    MAX_STEP_COUNT_Y_AXIS,
    (wellnessTrendsData?.stepCount?.max ?? MAX_STEP_COUNT_Y_AXIS) + offset
  );

  return (
    <Stack gap={0}>
      <Flex justify={'space-between'}>
        <Text fw={600}>Step Count</Text>
        <Select
          data={wellnessTrendOptions}
          value={String(wellnessTrendStepCountObj.days)}
          onChange={(value) =>
            setWellnessTrendStepCountObj({
              ...wellnessTrendStepCountObj,
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
        {wellnessTrendsData?.stepCount ? (
          <LineChart
            h={'100%'}
            data={chartData!}
            dataKey='date'
            series={[
              {
                name: 'stepCount',
                label: 'Step Count',
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
              domain: [minYAxis, maxYAxis],
              ticks: generateSequence(minYAxis, maxYAxis, sequenceStep),
            }}
            xAxisProps={{
              ticks: xTicks,
              tickFormatter: formatXAxis,
            }}
            gridProps={{ yAxisId: 'left' }}
            strokeWidth={2}
            tooltipProps={{
              formatter: (value) => [`${value}`, 'Step Count'],
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
