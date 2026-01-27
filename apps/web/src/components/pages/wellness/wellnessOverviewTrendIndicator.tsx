import { Flex, Text } from '@mantine/core';
import { WellnessOverviewTrend } from '@peernest/core';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

type TWellnessOverviewTrend = {
  trend: WellnessOverviewTrend;
  changePercentage: string;
  maxValue: string | number;
};

export default function WellnessOverviewTrendIndicator({
  trend,
  changePercentage,
  maxValue,
}: TWellnessOverviewTrend) {
  const upColor = '#12B886';
  const downColor = '#FA5252';

  const config: Record<WellnessOverviewTrend, React.ReactNode> = {
    [WellnessOverviewTrend.Up]: (
      <>
        <Text c='dimmed' size='sm' ml={4} mb={8}>
          /{maxValue}
        </Text>
        <Flex ml={8} mb={8} c={upColor}>
          {changePercentage}%
          <IconArrowUpRight />
        </Flex>
      </>
    ),
    [WellnessOverviewTrend.Down]: (
      <>
        <Text c='dimmed' size='sm' ml={4} mb={8}>
          /{maxValue}
        </Text>
        <Flex ml={8} mb={8} c={downColor}>
          {changePercentage}%
          <IconArrowDownRight />
        </Flex>
      </>
    ),
    [WellnessOverviewTrend.Neutral]: (
      <Text c='dimmed' size='sm' ml={4} mb={8}>
        /{maxValue}
      </Text>
    ),
  };

  return config[trend];
}
