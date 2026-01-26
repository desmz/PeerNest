import {
  Anchor,
  Avatar,
  Badge,
  Button,
  Divider,
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
  DELETE_COMMENT_URL,
  FIND_USER_COMMENTS_URL,
  TDeleteCommentParams,
  TFindUserCommentsQueryParams,
  TFindUserCommentsVo,
  urlBuilder,
} from '@peernest/contract';
import { dayjs, FindDiscussionsSortOption, FindUserCommentsSortOption } from '@peernest/core';
import {
  IconArrowBack,
  IconCheck,
  IconChevronDown,
  IconEdit,
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

async function getComments(queryParams: TFindUserCommentsQueryParams) {
  const url = buildQueryParamsUrl(FIND_USER_COMMENTS_URL, queryParams);
  return api.get<TFindUserCommentsVo>(url);
}

async function deleteComments(params: TDeleteCommentParams) {
  const url = urlBuilder(DELETE_COMMENT_URL, params);
  await api.delete<void>(url);
}

// ================= COMPONENT =================

export default function ProfileDiscussionComments() {
  const queryClient = useQueryClient();
  const [currentUser] = useAtom(currentUserAtom);

  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindDiscussionsSortOption.Newest)
  );

  const [opened, handlers] = useDisclosure(false);
  const [selectedCommentId, setSelectedCommentId] = React.useState<string | null>(null);

  const { data: commentsData } = useQuery({
    queryKey: ['comments', currentUser?.id, selectedSort],
    queryFn: async () => {
      const res = await getComments({
        authorId: currentUser?.id ?? '',
        sort: selectedSort?.toLowerCase() as FindUserCommentsSortOption,
      });
      return res.data;
    },
    enabled: !!currentUser,
  });

  async function handleDeleteConfirm() {
    if (!selectedCommentId) return;

    await deleteComments({ commentId: selectedCommentId });

    handlers.close();
    setSelectedCommentId(null);

    queryClient.invalidateQueries({ queryKey: ['comments'] });
  }

  return (
    <Flex direction='column' bg='gray.1' align='center'>
      {/* SORT */}
      <Flex w={816} pt='xs' justify='flex-end'>
        <Select
          value={selectedSort}
          onChange={setSelectedSort}
          data={Object.values(FindUserCommentsSortOption).map(capitalizeFirstLetter)}
          radius='xl'
          w={110}
          rightSection={<IconChevronDown size={16} />}
        />
      </Flex>

      {/* LIST */}
      <Stack align='center' py='sm'>
        {commentsData?.comments?.map((comment) =>
          comment.discussion !== null ? (
            <Anchor
              key={comment.discussionId}
              href={`${APP_ROUTE.DISCUSSION}/${comment.discussionId}`}
              underline='never'
              c='black'>
              <Flex direction='column' bg='white' bdrs='md' p='xs' gap={8} w={816}>
                {/* HEADER */}
                <Flex justify='space-between'>
                  <Text fw={600}>{comment.discussion?.discussionTitle}</Text>
                </Flex>

                {/* TAGS */}
                <Group gap={8} wrap='nowrap'>
                  {(comment.discussion?.interests ?? []).map((interest) => (
                    <Badge
                      key={interest.interestId}
                      color='blue'
                      size='sm'
                      fw={600}
                      style={{ textTransform: 'capitalize' }}>
                      {interest.interestName}
                    </Badge>
                  ))}
                  {(comment.discussion?.goals ?? []).map((i) => (
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
                <Text size='sm'>{comment.discussion?.discussionContent}</Text>

                {/* FOOTER */}
                <Group justify='space-between'>
                  <Flex align='center' gap={12}>
                    <Avatar src={comment.author.userAvatarUrl} />
                    <Stack gap={0}>
                      <Text>{comment.author.userDisplayName}</Text>
                      <Text size='xs' c='gray.6'>
                        Posted {dayjs(comment.discussion?.discussionCreatedTime).fromNow()}
                      </Text>
                    </Stack>
                  </Flex>

                  <Flex gap={12}>
                    <Flex align='center' gap={4}>
                      <IconHeart size={14} />
                      <Text size='sm'>{comment.likeCount}</Text>
                    </Flex>
                    <Flex align='center' gap={4}>
                      <IconMessage size={14} />
                      <Text size='sm'>{comment.discussion?.commentCount}</Text>
                    </Flex>
                  </Flex>
                </Group>
                <Divider my='xs' />
                <Flex>
                  <Group align='top'>
                    <Avatar src={currentUser?.avatarUrl}></Avatar>
                    <Stack gap={8}>
                      <Text size='sm' fw={700}>
                        {currentUser?.displayName}
                      </Text>
                      <Text size='sm'>{comment.commentContent}</Text>
                      <Group>
                        <Flex gap={12}>
                          <Flex align='center' gap={4}>
                            <IconHeart size={14} />
                            <Text size='sm'>{comment.likeCount}</Text>
                          </Flex>
                          <Flex align='center' gap={4}>
                            <IconArrowBack size={14} />
                            <Text size='sm'>{comment.replyCount}</Text>
                          </Flex>
                          <Flex align='center' gap={4}>
                            <IconEdit size={14} color='blue' />
                            <Text size='sm' c={'blue'}>
                              Edit
                            </Text>
                          </Flex>
                          <Flex
                            align='center'
                            gap={4}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedCommentId(comment.commentId);
                              handlers.open();
                            }}>
                            <IconTrash size={14} color='red' />
                            <Text size='sm' c={'red'}>
                              Delete
                            </Text>
                          </Flex>
                        </Flex>
                      </Group>
                    </Stack>
                  </Group>
                </Flex>
              </Flex>
            </Anchor>
          ) : (
            <Anchor key={comment.discussionId} href={APP_ROUTE.HOME} underline='never' c='black'>
              <Flex direction='column' bg='white' bdrs='md' p='xs' gap={8} w={816}>
                {/* HEADER */}
                <Flex justify='space-between'>
                  <Text fw={600}>{comment.parentComment?.commentContent}</Text>
                </Flex>

                {/* FOOTER */}
                <Group justify='space-between'>
                  <Flex align='center' gap={12}>
                    <Avatar src={comment.parentComment?.author.userAvatarUrl} />
                    <Stack gap={0}>
                      <Text>{comment.parentComment?.author.userDisplayName}</Text>
                      <Text size='xs' c='gray.6'>
                        Posted {dayjs(comment.commentCreatedTime).fromNow()}
                      </Text>
                    </Stack>
                  </Flex>

                  <Flex gap={12}>
                    <Flex align='center' gap={4}>
                      <IconHeart size={14} />
                      <Text size='sm'>{comment.parentComment?.likeCount}</Text>
                    </Flex>
                    <Flex align='center' gap={4}>
                      <IconArrowBack size={14} />
                      <Text size='sm'>{comment.parentComment?.replyCount}</Text>
                    </Flex>
                  </Flex>
                </Group>
                <Divider my='xs' />
                <Flex>
                  <Group align='top'>
                    <Avatar src={currentUser?.avatarUrl}></Avatar>
                    <Stack gap={8}>
                      <Text size='sm' fw={700}>
                        {currentUser?.displayName}
                      </Text>
                      <Text size='sm'>{comment.commentContent}</Text>
                      <Group>
                        <Flex gap={12}>
                          <Flex align='center' gap={4}>
                            <IconHeart size={14} />
                            <Text size='sm'>{comment.likeCount}</Text>
                          </Flex>
                          <Flex align='center' gap={4}>
                            <IconArrowBack size={14} />
                            <Text size='sm'>{comment.replyCount}</Text>
                          </Flex>
                          <Flex align='center' gap={4}>
                            <IconEdit size={14} color='blue' />
                            <Text size='sm' c={'blue'}>
                              Edit
                            </Text>
                          </Flex>
                          <Flex
                            align='center'
                            gap={4}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedCommentId(comment.commentId);
                              handlers.open();
                            }}>
                            <IconTrash size={14} color='red' />
                            <Text size='sm' c={'red'}>
                              Delete
                            </Text>
                          </Flex>
                        </Flex>
                      </Group>
                    </Stack>
                  </Group>
                </Flex>
              </Flex>
            </Anchor>
          )
        )}
      </Stack>

      {/* MODAL (OUTSIDE LIST) */}
      <Modal
        opened={opened}
        onClose={handlers.close}
        title='Are you sure you want to delete this comment?'
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
