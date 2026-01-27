import { Anchor, Avatar, Badge, Flex, Group, Select, Stack, Text } from '@mantine/core';
import {
  buildQueryParamsUrl,
  FIND_DISCUSSIONS_URL,
  TFindDiscussionsQueryParams,
  TFindDiscussionsVo,
} from '@peernest/contract';
import { dayjs, FindDiscussionsSortOption } from '@peernest/core';
import { IconChevronDown, IconHeart, IconMessage } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import requiredTime from 'dayjs/plugin/relativeTime';
import { useAtom } from 'jotai';
import React from 'react';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

dayjs.extend(requiredTime);

// ================= API =================

async function getDiscussions(queryParams: TFindDiscussionsQueryParams) {
  const url = buildQueryParamsUrl(FIND_DISCUSSIONS_URL, queryParams);
  return api.get<TFindDiscussionsVo>(url);
}

// ================= COMPONENT =================

export default function ProfileDiscussionLiked() {
  const [currentUser] = useAtom(currentUserAtom);

  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindDiscussionsSortOption.Newest)
  );

  const { data: discussionsData } = useQuery({
    queryKey: ['discussions', currentUser?.id, 'liked', selectedSort],
    queryFn: async () => {
      const res = await getDiscussions({
        sort: selectedSort?.toLowerCase() as FindDiscussionsSortOption,
        likedBy: currentUser?.id,
      });
      return res.data;
    },
    enabled: !!currentUser,
  });

  return (
    <Flex direction='column' bg='gray.1' align='center'>
      {/* SORT */}
      <Flex w={816} pt='xs' justify='flex-end'>
        <Select
          value={selectedSort}
          onChange={setSelectedSort}
          data={Object.values(FindDiscussionsSortOption).map(capitalizeFirstLetter)}
          radius='xl'
          w={110}
          rightSection={<IconChevronDown size={16} />}
        />
      </Flex>

      {/* LIST */}
      <Stack align='center' py='sm'>
        {discussionsData?.discussions?.map((discussion) => (
          <Anchor
            key={discussion.discussionId}
            href={`${APP_ROUTE.DISCUSSION}/${discussion.discussionId}`}
            underline='never'
            c='black'>
            <Flex direction='column' bg='white' bdrs='md' p='xs' gap={8} w={816}>
              {/* HEADER */}
              <Flex justify='space-between'>
                <Text fw={600}>{discussion.discussionTitle}</Text>
              </Flex>

              {/* TAGS */}
              <Group gap={8} wrap='nowrap'>
                {(discussion.interests ?? []).map((interest) => (
                  <Badge
                    key={interest.interestId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {interest.interestName}
                  </Badge>
                ))}
                {(discussion.goals ?? []).map((i) => (
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

              {/* CONTENT */}
              <Text size='sm'>{discussion.discussionContent}</Text>

              {/* FOOTER */}
              <Group justify='space-between'>
                <Flex align='center' gap={12}>
                  <Avatar src={discussion.author.userAvatarUrl} />
                  <Stack gap={0}>
                    <Text>{discussion.author.userDisplayName}</Text>
                    <Text size='xs' c='gray.6'>
                      Posted {dayjs(discussion.discussionCreatedTime).fromNow()}
                    </Text>
                  </Stack>
                </Flex>

                <Flex gap={12}>
                  <Flex align='center' gap={4}>
                    <IconHeart size={14} color='red' fill='red' />
                    <Text size='sm' c={'red'}>
                      {discussion.likeCount}
                    </Text>
                  </Flex>
                  <Flex align='center' gap={4}>
                    <IconMessage size={14} />
                    <Text size='sm'>{discussion.commentCount}</Text>
                  </Flex>
                </Flex>
              </Group>
            </Flex>
          </Anchor>
        ))}
      </Stack>
    </Flex>
  );
}
