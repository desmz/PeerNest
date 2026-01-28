/* eslint-disable @typescript-eslint/naming-convention */
import { Card, Center, Flex, Paper, Text } from '@mantine/core';
import { Calendar } from '@mantine/dates';
import {
  buildQueryParamsUrl,
  GET_WELLNESS_CALENDAR_URL,
  TGetWellnessCalendarQueryParams,
  TGetWellnessCalendarVo,
} from '@peernest/contract';
import {
  IconMoodEmpty,
  IconMoodSad,
  IconMoodSadDizzy,
  IconMoodSmile,
  IconMoodSmileBeam,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

import api from '@/lib/api-client';

async function getWellnessCalendar(queryParams: TGetWellnessCalendarQueryParams) {
  const url = buildQueryParamsUrl(GET_WELLNESS_CALENDAR_URL, queryParams);
  return api.get<TGetWellnessCalendarVo>(url);
}

const ratingEmojiMap = {
  '1': <IconMoodSadDizzy />,
  '3': <IconMoodSad />,
  '4': <IconMoodEmpty />,
  '6': <IconMoodSmile />,
  '8': <IconMoodSmileBeam />,
};

const ratingArr = Object.keys(ratingEmojiMap).map((str) => Number(str)); // 0-indexed

export default function WellnessCalendarSection() {
  const [viewDate, setViewDate] = useState(new Date());

  const getRatingStyle = (rating: number) => {
    return `rating.${ratingArr[Math.floor(rating / 2)]}`;
  };

  const year = dayjs(viewDate).year();
  const month = dayjs(viewDate).month() + 1;
  const { data: calendarData = [] } = useQuery({
    queryKey: ['wellness', 'calendar', year, month],
    queryFn: async () => {
      const { data } = await getWellnessCalendar({ year, month });
      return data;
    },
  });

  const findDayData = (date: string) =>
    calendarData.find((d) => dayjs(d.checkInDate).isSame(date, 'day'));

  return (
    <Paper w={'fit-content'} bdrs={'xl'}>
      <Card bdrs={'md'} p={'sm'} w={'fit-content'} mih={'fit-content'}>
        <Calendar
          static
          highlightToday
          weekendDays={[]}
          onMonthSelect={(d) => setViewDate(new Date(d))}
          onNextMonth={(d) => setViewDate(new Date(d))}
          onPreviousMonth={(d) => setViewDate(new Date(d))}
          renderDay={(date) => {
            const day = dayjs(date).date();
            const dayData = findDayData(date);

            if (!dayData) {
              return (
                <Flex justify='center' align='center' w={28} h={28}>
                  <Text fz='sm'>{day}</Text>
                </Flex>
              );
            }

            return (
              <Flex
                justify={'center'}
                align={'center'}
                w={28}
                h={28}
                bg={getRatingStyle(dayData.moodRating)}
                bdrs={'100%'}>
                <Text fz={'sm'} lh={0}>
                  {day}
                </Text>
              </Flex>
            );
          }}
        />
      </Card>
      <Flex>
        {Object.entries(ratingEmojiMap).map(([rating, emoji]) => (
          <Center bg={`rating.${rating}`} flex={1} py={6}>
            {emoji}
          </Center>
        ))}
      </Flex>
    </Paper>
  );
}
