import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Modal,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  buildQueryParamsUrl,
  DELETE_DISCUSSION_URL,
  FIND_DISCUSSIONS_URL,
  TDeleteDiscussionParams,
  TFindDiscussionsQueryParams,
  TFindDiscussionsVo,
  urlBuilder,
} from '@peernest/contract';
import { dayjs, FindDiscussionsSortOption } from '@peernest/core';
import {
  IconCheck,
  IconChevronDown,
  IconHeart,
  IconMessage,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

async function deleteDiscussion(params: TDeleteDiscussionParams) {
  const url = urlBuilder(DELETE_DISCUSSION_URL, params);
  await api.delete<void>(url);
}

// ================= COMPONENT =================

export default function ProfileDiscussionPosts() {
  const queryClient = useQueryClient();
  const [currentUser] = useAtom(currentUserAtom);

  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindDiscussionsSortOption.Newest)
  );

  const [opened, handlers] = useDisclosure(false);
  const [selectedDiscussionId, setSelectedDiscussionId] = React.useState<string | null>(null);

  const { data: discussionsData } = useQuery({
    queryKey: ['discussions', currentUser?.id, selectedSort],
    queryFn: async () => {
      const res = await getDiscussions({
        sort: selectedSort?.toLowerCase() as FindDiscussionsSortOption,
        authorId: currentUser?.id,
      });
      return res.data;
    },
    enabled: !!currentUser,
  });

  async function handleDeleteConfirm() {
    if (!selectedDiscussionId) return;

    await deleteDiscussion({ discussionId: selectedDiscussionId });

    handlers.close();
    setSelectedDiscussionId(null);

    queryClient.invalidateQueries({ queryKey: ['discussions'] });
  }

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

                <Button
                  variant='light'
                  color='red'
                  radius='xl'
                  size='xs'
                  leftSection={<IconTrash size={16} />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSelectedDiscussionId(discussion.discussionId);
                    handlers.open();
                  }}>
                  Delete
                </Button>
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
                    <IconHeart size={14} />
                    <Text size='sm'>{discussion.likeCount}</Text>
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

      {/* MODAL (OUTSIDE LIST) */}
      <Modal
        opened={opened}
        onClose={handlers.close}
        title='Are you sure you want to delete this post?'
        centered
        bdrs={'lg'}>
        <Flex justify='flex-end' gap='xs'>
          <Button
            variant='light'
            color='green'
            radius='xl'
            leftSection={<IconCheck size={16} />}
            onClick={handleDeleteConfirm}>
            YES
          </Button>
          <Button
            variant='light'
            color='red'
            radius='xl'
            leftSection={<IconX size={16} />}
            onClick={handlers.close}>
            NO
          </Button>
        </Flex>
      </Modal>
    </Flex>
  );
}
