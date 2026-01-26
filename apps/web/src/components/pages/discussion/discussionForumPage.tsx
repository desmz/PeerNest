import {
  Anchor,
  Avatar,
  Badge,
  Center,
  Flex,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import {
  buildQueryParamsUrl,
  FIND_DISCUSSIONS_URL,
  GET_INTERESTS_URL,
  GET_PERSONAL_GOALS_URL,
  TFindDiscussionsQueryParams,
  TFindDiscussionsVo,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
} from '@peernest/contract';
import { dayjs, FindDiscussionsSortOption } from '@peernest/core';
import { IconChevronDown, IconHeart, IconMessage } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import requiredTime from 'dayjs/plugin/relativeTime';
import React from 'react';

import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

dayjs.extend(requiredTime);

async function getDiscussions(queryParams: TFindDiscussionsQueryParams) {
  // const cleanParams = Object.fromEntries(
  //   Object.entries(queryParams).filter(([, value]) => value != null)
  // ) as Record<string, string | number | boolean>;
  const url = buildQueryParamsUrl(FIND_DISCUSSIONS_URL, queryParams);
  return api.get<TFindDiscussionsVo>(url);
}

async function getGoals() {
  return api.get<TGetPersonalGoalsVo>(GET_PERSONAL_GOALS_URL);
}

async function getInterests() {
  return api.get<TGetInterestsVo>(GET_INTERESTS_URL);
}

export default function DiscussionForumPage() {
  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindDiscussionsSortOption.Trending)
  );
  const [selectedInterests, setSelectedInterests] = React.useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = React.useState<string[]>([]);

  const { data: goalData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await getGoals();
      return res.data;
    },
  });

  const { data: interestData } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      const res = await getInterests();
      return res.data;
    },
  });

  const { data: discussionsData } = useQuery({
    queryKey: ['discussions', selectedSort, selectedInterests, selectedGoals],
    queryFn: async () => {
      const res = await getDiscussions({
        sort: selectedSort?.toLocaleLowerCase() as FindDiscussionsSortOption,
        goalIds: selectedGoals,
        interestIds: selectedInterests,
      });
      return res.data;
    },
  });

  const { data: discussionsTrending } = useQuery({
    queryKey: ['discussions', FindDiscussionsSortOption.Trending],
    queryFn: async () => {
      const res = await getDiscussions({
        sort: FindDiscussionsSortOption.Trending,
      });
      return res.data;
    },
  });

  const goalNames =
    goalData?.map((goal) => ({
      label: goal.personalGoalTitle.charAt(0).toUpperCase() + goal.personalGoalTitle.slice(1),
      value: goal.personalGoalId,
    })) ?? [];

  const interestNames =
    interestData?.map((interest) => ({
      label: interest.interestName.charAt(0).toUpperCase() + interest.interestName.slice(1),
      value: interest.interestId,
    })) ?? [];

  return (
    <Stack>
      <Group px={'md'} gap={24} pt={'xs'}>
        <Select
          value={selectedSort}
          onChange={(value) => {
            setSelectedSort(value);
            console.log(value);
          }}
          data={Object.values(FindDiscussionsSortOption).map((v) => capitalizeFirstLetter(v))}
          radius='xl'
          w='110'
          rightSection={<IconChevronDown size={16} />}
        />
        <MultiSelect
          placeholder='Interests'
          data={interestNames}
          value={selectedInterests}
          onChange={setSelectedInterests}
          radius='md'
          w='395'
          hidePickedOptions
          maxValues={3}
          withScrollArea
          searchable
          styles={{
            pillsList: {
              flexWrap: 'nowrap',
              overflow: 'hidden',
              marginRight: '1.5rem',
            },
          }}
        />
        <MultiSelect
          placeholder='Goals'
          data={goalNames}
          value={selectedGoals}
          onChange={setSelectedGoals}
          radius='md'
          w='395'
          hidePickedOptions
          searchable
          maxValues={3}
          styles={{
            pillsList: {
              flexWrap: 'nowrap',
              overflow: 'hidden',
              marginRight: '1.5rem',
            },
          }}
        />
      </Group>
      <Flex direction={'row'} px={'md'} gap={24}>
        <Stack w={'72%'}>
          {discussionsData?.discussions?.map((discussionGroup) => {
            return (
              <Anchor
                href={`${APP_ROUTE.DISCUSSION}/${discussionGroup.discussionId}`}
                underline='never'
                c={'black'}
                key={discussionGroup.discussionId}>
                <Flex direction={'column'} bg={'white'} bdrs={'md'} p='xs' gap={8}>
                  <Flex bdrs='md'>
                    <Text fw={600}>{discussionGroup.discussionTitle}</Text>
                  </Flex>
                  <Group gap={8} wrap='nowrap'>
                    {(discussionGroup.interests ?? []).map((interest) => (
                      <Badge
                        key={interest.interestId}
                        color='blue'
                        size='sm'
                        fw={600}
                        style={{ textTransform: 'capitalize' }}>
                        {interest.interestName}
                      </Badge>
                    ))}
                    {(discussionGroup.goals ?? []).map((i) => (
                      <Badge
                        key={i.personalGoalId}
                        color='green'
                        size='sm'
                        fw={600}
                        style={{ textTransform: 'capitalize' }}>
                        {i.personalGoalTitle}
                      </Badge>
                    ))}
                  </Group>
                  <Flex>
                    <Text size='sm'>{discussionGroup.discussionContent}</Text>
                  </Flex>
                  <Group w={'auto'} justify='space-between' align='centre'>
                    <Flex align={'center'} gap={12}>
                      <Avatar src={discussionGroup.author.userAvatarUrl}></Avatar>
                      <Stack gap={0}>
                        <Text size='md'>{discussionGroup.author.userDisplayName}</Text>
                        <Text size='xs' c={'gray.6'}>
                          Posted {dayjs(discussionGroup.discussionCreatedTime).fromNow()}
                        </Text>
                      </Stack>
                    </Flex>
                    <Flex>
                      <Flex w={'fit-content'} align={'center'} px={4}>
                        <Text key={discussionGroup.discussionId} lineClamp={1}>
                          <IconHeart size={14} />
                          {discussionGroup.likeCount}
                        </Text>
                      </Flex>
                      <Flex w={'fit-content'} align={'center'} justify={'flex-end'} px={4}>
                        <Text key={discussionGroup.discussionId} lineClamp={1}>
                          <IconMessage size={14} />
                          {discussionGroup.commentCount}
                        </Text>
                      </Flex>
                    </Flex>
                  </Group>
                </Flex>
              </Anchor>
            );
          })}
        </Stack>
        <Flex direction={'column'} bg={'white'} w={'28%'} p={'xs'} h='220' bdrs='md'>
          <Text fw={600} px={'xs'}>
            Trending This Week
          </Text>
          <Flex direction={'column'} p={'xs'}>
            {discussionsTrending?.discussions?.slice(0, 6).map((discussion) => (
              <Anchor
                href={APP_ROUTE.HOME}
                underline='never'
                c={'black'}
                key={discussion.discussionId}>
                <Group>
                  <Flex w={208}>
                    <Text key={discussion.discussionId} lineClamp={1}>
                      {discussion.discussionTitle}
                    </Text>
                  </Flex>
                  <Flex w={'fit-content'} align={Center} justify={'flex-end'} px={2}>
                    <Text key={discussion.discussionId} lineClamp={1}>
                      <IconHeart size={14} />
                      {discussion.likeCount}
                    </Text>
                  </Flex>
                  <Flex w={'fit-content'} align={Center} justify={'flex-end'} px={2}>
                    <Text key={discussion.discussionId} lineClamp={1}>
                      <IconMessage size={14} />
                      {discussion.commentCount}
                    </Text>
                  </Flex>
                </Group>
              </Anchor>
            ))}
          </Flex>
        </Flex>
      </Flex>
    </Stack>
  );
}
