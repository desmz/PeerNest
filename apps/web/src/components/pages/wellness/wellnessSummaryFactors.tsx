import { Badge, Flex, Group, Select, Stack, Text, Title } from '@mantine/core';
import {
  buildQueryParamsUrl,
  GET_WELLNESS_FACTORS_SUMMARY_URL,
  TGetWellnessFactorsSummaryQueryParams,
  TGetWellnessFactorsSummaryVo,
} from '@peernest/contract';
import { WELLNESS_FACTORS_SUMMARY_DEFAULT_DAYS } from '@peernest/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import api from '@/lib/api-client';
import { capitalizeFirstLetterForFirstWord } from '@/lib/util';

async function getWellnessFactorsSummary(queryParams: TGetWellnessFactorsSummaryQueryParams) {
  const url = buildQueryParamsUrl(GET_WELLNESS_FACTORS_SUMMARY_URL, queryParams);
  return api.get<TGetWellnessFactorsSummaryVo>(url);
}

const wellnessSummaryFactorsOptions = [
  { label: '30d', value: '30' },
  { label: '7d', value: '7' },
];

export default function WellnessSummaryFactors() {
  const [summaryDays, setSummaryDays] = useState<number>(WELLNESS_FACTORS_SUMMARY_DEFAULT_DAYS);

  const { data: factorSummaryData, isLoading } = useQuery({
    queryKey: ['wellness', 'summary', 'factors', summaryDays],
    queryFn: async () => {
      const { data } = await getWellnessFactorsSummary({ days: summaryDays });
      return data;
    },
  });

  return (
    <Stack gap={0}>
      <Flex justify={'space-between'}>
        <Title order={3}>Factors</Title>
        <Select
          data={wellnessSummaryFactorsOptions}
          value={String(summaryDays)}
          onChange={(value) => setSummaryDays(Number(value))}
          rightSection={<IconChevronDown size={16} />}
          maw={72}
          size='sm'
          variant='outline'
          disabled={isLoading}
        />
      </Flex>
      {factorSummaryData ? (
        <Group gap={10}>
          {factorSummaryData.wellnessFactors.map((wellnessMood) => (
            <Flex
              justify={'center'}
              align={'center'}
              gap={8}
              fw={600}
              c='dimmed'
              fz={'xs'}
              bdrs={'sm'}
              py={4}
              px={12}
              bg={'gray.1'}
              style={{
                cursor: 'default',
              }}>
              {capitalizeFirstLetterForFirstWord(wellnessMood.wellnessFactorName)}
              <Badge size='xs' circle>
                {wellnessMood.count}
              </Badge>
            </Flex>
          ))}
        </Group>
      ) : (
        <Text fw={500} fz={'sm'} c={'dimmed'}>
          No data yet. Please check in daily.
        </Text>
      )}
    </Stack>
  );
}
