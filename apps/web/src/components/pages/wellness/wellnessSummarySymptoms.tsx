import { Badge, Flex, Group, Select, Stack, Text, Title } from '@mantine/core';
import {
  buildQueryParamsUrl,
  GET_WELLNESS_SYMPTOMS_SUMMARY_URL,
  TGetWellnessSymptomsSummaryQueryParams,
  TGetWellnessSymptomsSummaryVo,
} from '@peernest/contract';
import { WELLNESS_SYMPTOMS_SUMMARY_DEFAULT_DAYS } from '@peernest/core';
import { IconChevronDown } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import api from '@/lib/api-client';
import { capitalizeFirstLetterForFirstWord } from '@/lib/util';

async function getWellnessSymptomsSummary(queryParams: TGetWellnessSymptomsSummaryQueryParams) {
  const url = buildQueryParamsUrl(GET_WELLNESS_SYMPTOMS_SUMMARY_URL, queryParams);
  return api.get<TGetWellnessSymptomsSummaryVo>(url);
}

const wellnessSummarySymptomsOptions = [
  { label: '30d', value: '30' },
  { label: '7d', value: '7' },
];

export default function WellnessSummarySymptoms() {
  const [summaryDays, setSummaryDays] = useState<number>(WELLNESS_SYMPTOMS_SUMMARY_DEFAULT_DAYS);

  const { data: symptomSummaryData, isLoading } = useQuery({
    queryKey: ['wellness', 'summary', 'symptoms', summaryDays],
    queryFn: async () => {
      const { data } = await getWellnessSymptomsSummary({ days: summaryDays });
      return data;
    },
  });

  return (
    <Stack gap={0}>
      <Flex justify={'space-between'}>
        <Title order={3}>Symptoms</Title>
        <Select
          data={wellnessSummarySymptomsOptions}
          value={String(summaryDays)}
          onChange={(value) => setSummaryDays(Number(value))}
          rightSection={<IconChevronDown size={16} />}
          maw={72}
          size='sm'
          variant='outline'
          disabled={isLoading}
        />
      </Flex>
      {symptomSummaryData ? (
        <Group gap={10}>
          {symptomSummaryData.wellnessSymptoms.map((wellnessMood) => (
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
              {capitalizeFirstLetterForFirstWord(wellnessMood.wellnessSymptomName)}
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
