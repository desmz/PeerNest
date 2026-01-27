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
  FIND_ARCHIVED_DISCUSSIONS_URL,
  TDeleteDiscussionParams,
  TFindArchivedDiscussionsQueryParams,
  TFindArchivedDiscussionVo,
  TUnarchiveDiscussionParams,
  UNARCHIVE_DISCUSSION_URL,
  urlBuilder,
} from '@peernest/contract';
import { dayjs, FindArchivedDiscussionsSortOption } from '@peernest/core';
import {
  IconCheck,
  IconChevronDown,
  IconHeart,
  IconMessage,
  IconTrash,
  IconX,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';
import { queryClient } from '@/main';

async function getArchived(queryParams: TFindArchivedDiscussionsQueryParams) {
  const url = buildQueryParamsUrl(FIND_ARCHIVED_DISCUSSIONS_URL, queryParams);
  return api.get<TFindArchivedDiscussionVo>(url);
}

async function deleteArchive(params: TDeleteDiscussionParams) {
  const url = urlBuilder(DELETE_DISCUSSION_URL, params);
  return api.delete<void>(url);
}

async function releaseArchive(params: TUnarchiveDiscussionParams) {
  const url = urlBuilder(UNARCHIVE_DISCUSSION_URL, params);
  return api.post<void>(url);
}

export default function ManageDiscussionsReport() {
  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindArchivedDiscussionsSortOption.Newest)
  );

  const [opened, handlers] = useDisclosure(false);
  const [selectedDeleteId, setSelectedDeleteId] = React.useState<string | null>(null);
  const [open, handle] = useDisclosure(false);
  const [selectedReleaseId, setSelectedReleaseId] = React.useState<string | null>(null);

  async function handleDeleteConfirm() {
    if (!selectedDeleteId) return;

    await deleteArchive({ discussionId: selectedDeleteId });
    console.log(selectedDeleteId);

    handlers.close();
    setSelectedDeleteId(null);

    queryClient.invalidateQueries({ queryKey: ['archives'] });
  }

  async function handleReleaseConfirm() {
    if (!selectedReleaseId) return;

    await releaseArchive({ discussionId: selectedReleaseId });
    console.log(selectedReleaseId);

    handle.close();
    setSelectedReleaseId(null);

    queryClient.invalidateQueries({ queryKey: ['archives'] });
  }

  const { data: archivedData } = useQuery({
    queryKey: ['archives', selectedSort],
    queryFn: async () => {
      const res = await getArchived({
        sort: selectedSort?.toLowerCase() as FindArchivedDiscussionsSortOption,
      });
      return res.data;
    },
  });

  return (
    <Flex direction='column' bg='gray.1' align='center'>
      <Flex w={816} pt='xs' justify='flex-end'>
        <Select
          value={selectedSort}
          onChange={setSelectedSort}
          data={Object.values(FindArchivedDiscussionsSortOption).map(capitalizeFirstLetter)}
          radius='xl'
          w={125}
          rightSection={<IconChevronDown size={16} />}
        />
      </Flex>

      <Stack align='center' py='sm'>
        {archivedData?.discussions?.map((archived) => (
          <Anchor
            key={archived.discussionId}
            href={`${APP_ROUTE.DISCUSSION}/${archived.discussionId}`}
            underline='never'
            c='black'>
            <Flex direction='column' bg='white' bdrs='md' p='sm' gap={8} w={816}>
              <Flex justify='space-between' c='grey'>
                <Text fw={600} size='xs'>
                  Archived at {dayjs(archived.discussionArchivedTime).format('DD/MM/YYYY')} by{' '}
                  {archived.discussionArchivedByName}
                </Text>
              </Flex>
              {/* HEADER */}
              <Flex justify='space-between'>
                <Text fw={600}>{archived.discussionTitle}</Text>

                <Flex gap={8}>
                  <Button
                    variant='light'
                    color='green'
                    radius='xl'
                    size='xs'
                    leftSection={<IconX size={16} />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedReleaseId(archived.discussionId);
                      handle.open();
                    }}>
                    Release
                  </Button>
                  <Button
                    variant='light'
                    color='red'
                    radius='xl'
                    size='xs'
                    leftSection={<IconTrash size={16} />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedDeleteId(archived.discussionId);
                      handlers.open();
                    }}>
                    Delete
                  </Button>
                </Flex>
              </Flex>

              {/* TAGS */}
              <Group gap={8} wrap='nowrap'>
                {(archived.interests ?? []).map((interest) => (
                  <Badge
                    key={interest.interestId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {interest.interestName}
                  </Badge>
                ))}
                {(archived.goals ?? []).map((i) => (
                  <Badge
                    key={i.personalGoalId}
                    color='green'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {i.personalGoalTitle}
                    Goal
                  </Badge>
                ))}
              </Group>

              {/* CONTENT */}
              <Text size='sm'>{archived.discussionContent}</Text>

              {/* FOOTER */}
              <Group justify='space-between'>
                <Flex align='center' gap={12}>
                  <Avatar src={archived.author.userAvatarUrl} />
                  <Stack gap={0}>
                    <Text size='sm'>{archived.author.userDisplayName}</Text>
                    <Text size='xs' c='gray.6'>
                      Posted {dayjs(archived.discussionCreatedTime).fromNow()}
                    </Text>
                  </Stack>
                </Flex>

                <Flex gap={12}>
                  <Flex align='center' gap={4}>
                    <IconHeart size={14} />
                    <Text size='sm'>{archived.likeCount}</Text>
                  </Flex>
                  <Flex align='center' gap={4}>
                    <IconMessage size={14} />
                    <Text size='sm'>{archived.commentCount}</Text>
                  </Flex>
                </Flex>
              </Group>
            </Flex>
          </Anchor>
        ))}
      </Stack>

      {/* MODAL (OUTSIDE LIST) */}
      <Modal
        opened={open}
        onClose={handle.close}
        title='Are you sure you want to release this discussion/comment?'
        centered
        bdrs={'lg'}>
        <Flex justify='flex-end' gap='xs'>
          <Button
            variant='light'
            color='green'
            radius='xl'
            leftSection={<IconCheck size={16} />}
            onClick={handleReleaseConfirm}>
            YES
          </Button>
          <Button
            variant='light'
            color='red'
            radius='xl'
            leftSection={<IconX size={16} />}
            onClick={handle.close}>
            NO
          </Button>
        </Flex>
      </Modal>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title='Are you sure you want to delete this discussion/comment?'
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
