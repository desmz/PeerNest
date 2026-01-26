import {
  Avatar,
  Badge,
  Button,
  Flex,
  Group,
  Input,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  buildQueryParamsUrl,
  CREATE_COMMENT_URL,
  FIND_DISCUSSION_COMMENTS_URL,
  GET_DISCUSSION_URL,
  LIKE_COMMENT_URL,
  LIKE_DISCUSSION_URL,
  REPLY_COMMENT_URL,
  REPORT_COMMENT_URL,
  REPORT_DISCUSSION_URL,
  TCreateCommentRo,
  TFindDiscussionCommentsParams,
  TFindDiscussionCommentsQueryParams,
  TFindDiscussionCommentsVo,
  TGetDiscussionParams,
  TGetDiscussionVo,
  TLikeCommentParams,
  TLikeDiscussionParams,
  TMixedFindDiscussionCommentsSchema,
  TReplyCommentParams,
  TReplyCommentRo,
  TReportCommentParams,
  TReportDiscussionParams,
  TUnlikeCommentParams,
  TUnlikeDiscussionParams,
  UNLIKE_COMMENT_URL,
  UNLIKE_DISCUSSION_URL,
  urlBuilder,
} from '@peernest/contract';
import { FindDiscussionCommentsSortOption } from '@peernest/core';
import {
  IconArrowBack,
  IconCheck,
  IconChevronDown,
  IconFlag,
  IconHeart,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useAtom } from 'jotai';
// import { zod4Resolver } from 'mantine-form-zod-resolver';
import React from 'react';
import { useParams } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { capitalizeFirstLetter } from '@/lib/util';
import { queryClient } from '@/main';

type TCommentComponentProps = {
  comment: TMixedFindDiscussionCommentsSchema;
  parentCommentAuthorName: string | null;
};

function CommentComponent({ comment, parentCommentAuthorName }: TCommentComponentProps) {
  async function reportComment(params: TReportCommentParams) {
    const url = urlBuilder(REPORT_COMMENT_URL, params);
    return api.post<void>(url);
  }

  async function replyComments(params: TReplyCommentParams, data: TReplyCommentRo) {
    const url = urlBuilder(REPLY_COMMENT_URL, params);
    const res = await api.post<void>(url, data);
    return res.data;
  }

  async function likeReplies(params: TLikeCommentParams) {
    const url = urlBuilder(LIKE_COMMENT_URL, params);
    return api.post<void>(url);
  }

  async function unlikeReplies(params: TUnlikeCommentParams) {
    const url = urlBuilder(UNLIKE_COMMENT_URL, params);
    return api.delete<void>(url);
  }

  const [open, handle] = useDisclosure(false);
  const [opened, handled] = useDisclosure(false);
  const [replyToCommentId, setReplyToCommentId] = React.useState<string | null>(null);

  async function handleReportCommentConfirm() {
    if (!selectedReportComment) return;

    await reportComment({ commentId: selectedReportComment });

    handle.close();
    setSelectedReportComment(null);
  }

  const likeRepliesMutation = useMutation({
    mutationFn: (params: TLikeCommentParams) => likeReplies(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments'],
      });
    },
  });

  const unlikeRepliesMutation = useMutation({
    mutationFn: (params: TUnlikeCommentParams) => unlikeReplies(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['comments'],
      });
    },
  });

  function handleLikeRepliesToggle() {
    if (!comment?.commentId || comment.isDeleted) return;

    if (comment.isLiked) {
      unlikeRepliesMutation.mutate({
        commentId: comment.commentId,
      });
    } else {
      likeRepliesMutation.mutate({
        commentId: comment.commentId,
      });
    }
  }

  const replyCommentForm = useForm<TReplyCommentRo>({
    initialValues: {
      commentContent: '',
    },
    // validate: zod4Resolver(createCommentRoSchema),
  });

  const replyCommentMutation = useMutation<
    void,
    Error,
    { commentId: string; data: TReplyCommentRo }
  >({
    mutationFn: ({ commentId, data }) => replyComments({ commentId }, data),
    onSuccess: (_, variables) => {
      notifications.show({
        message: `Your comment is posted successfully!`,
        color: 'green',
      });

      queryClient.invalidateQueries({
        queryKey: ['comments'],
      });

      handled.close();
      replyCommentForm.reset();
    },
    onError: () => {
      notifications.show({
        message: `Error: Your comment is failed to submit. Please try again.`,
        color: 'red',
      });
    },
  });

  function onReplySubmit(data: TReplyCommentRo) {
    if (!replyToCommentId) return;
    replyCommentMutation.mutate({
      commentId: replyToCommentId,
      data,
    });
  }

  const [selectedReportComment, setSelectedReportComment] = React.useState<string | null>(null);
  return (
    <>
      {comment.isDeleted && (
        <Flex py={'sm'}>
          <Group align='top'>
            <Avatar radius='xl' />
            <Stack dir='column' gap={2}>
              <Text>Deleted</Text>
              <Text>This Comment is deleted.</Text>
            </Stack>
          </Group>
        </Flex>
      )}
      {!comment.isDeleted && (
        <Flex py={'xs'}>
          <Group align='top'>
            <Avatar src={comment.author.userAvatarUrl} size={32} />
            <Stack dir='column' gap={2} w={740}>
              {comment.commentParentCommentId === null ? (
                <Text fw={700}>{comment.author.userDisplayName}</Text>
              ) : (
                <Text fw={700}>
                  {comment.author.userDisplayName} replied to{' '}
                  {parentCommentAuthorName ?? 'unknown user'}
                </Text>
              )}

              <Text>{comment.commentContent}</Text>
              <Flex gap={12}>
                <Flex align='center' gap={4}>
                  <Button
                    variant='subtle'
                    leftSection={<IconHeart size={14} />}
                    loading={likeRepliesMutation.isPending || unlikeRepliesMutation.isPending}
                    onClick={handleLikeRepliesToggle}
                    color={comment?.isLiked ? 'red' : 'black'}>
                    {comment?.likeCount}
                  </Button>
                </Flex>
                <Flex align='center' gap={4}>
                  <Button
                    variant='subtle'
                    leftSection={<IconArrowBack size={14} />}
                    color='black'
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedReportComment(comment.commentId);
                      handled.open();
                    }}>
                    {comment?.replyCount}
                  </Button>
                </Flex>
                <Flex align='center' gap={4}>
                  <Button
                    size='xs'
                    variant='transparent'
                    c={'red'}
                    leftSection={<IconFlag size={14} />}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedReportComment(comment.commentId);
                      handle.open();
                    }}>
                    Report
                  </Button>
                </Flex>
              </Flex>
            </Stack>
          </Group>

          {/* Comment Report */}
          <Modal
            opened={open}
            onClose={handle.close}
            title='Are you sure you want to report this comment?'
            centered
            bdrs={'lg'}>
            <Flex justify='flex-end' gap='xs'>
              <Button
                variant='light'
                color='green'
                radius='xl'
                leftSection={<IconCheck size={16} />}
                onClick={handleReportCommentConfirm}>
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
            onClose={handled.close}
            title='Replying to Comment.'
            centered
            bdrs={'lg'}>
            <form onSubmit={replyCommentForm.onSubmit(onReplySubmit)}>
              <Textarea
                label='Reply Comment'
                placeholder='Input placeholder'
                {...replyCommentForm.getInputProps('commentContent')}
              />
              <Flex justify={'flex-end'} p={'sm'}>
                <Button
                  size='xs'
                  justify='flex-end'
                  onClick={(e) => {
                    setReplyToCommentId(comment.commentId);
                  }}
                  type='submit'>
                  Reply
                </Button>
              </Flex>
            </form>
          </Modal>
        </Flex>
      )}
      {comment.replies &&
        comment.replies?.length > 0 &&
        comment.replies.map((reply) => (
          <CommentComponent
            comment={reply}
            parentCommentAuthorName={comment.isDeleted ? null : comment.author.userDisplayName}
            key={reply.commentId}
          />
        ))}
    </>
  );
}

async function getDiscussions(params: TGetDiscussionParams) {
  const url = urlBuilder(GET_DISCUSSION_URL, params);
  return api.get<TGetDiscussionVo>(url);
}

async function createComments(data: TCreateCommentRo) {
  const res = await api.post<void>(CREATE_COMMENT_URL, data);
  return res.data;
}

async function getComments(
  params: TFindDiscussionCommentsParams,
  queryParams: TFindDiscussionCommentsQueryParams
) {
  let url = urlBuilder(FIND_DISCUSSION_COMMENTS_URL, params);
  url = buildQueryParamsUrl(url, queryParams);
  return api.get<TFindDiscussionCommentsVo>(url);
}

async function reportDiscussion(params: TReportDiscussionParams) {
  const url = urlBuilder(REPORT_DISCUSSION_URL, params);
  return api.post<void>(url);
}

async function likeDiscussion(params: TLikeDiscussionParams) {
  const url = urlBuilder(LIKE_DISCUSSION_URL, params);
  return api.post<void>(url);
}

async function unlikeDiscussion(params: TUnlikeDiscussionParams) {
  const url = urlBuilder(UNLIKE_DISCUSSION_URL, params);
  return api.delete<void>(url);
}

export default function PostDetailPage() {
  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindDiscussionCommentsSortOption.Newest)
  );

  const [currentUser] = useAtom(currentUserAtom);

  const { discussionId } = useParams<{ discussionId: string }>();

  const [opened, handlers] = useDisclosure(false);
  const [selectedReport, setSelectedReport] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: discussion } = useQuery({
    queryKey: ['discussions', discussionId],
    queryFn: async () => {
      const res = await getDiscussions({ discussionId: discussionId! });
      return res.data;
    },
    enabled: !!discussionId,
  });

  const { data: comments } = useQuery({
    queryKey: ['comments', selectedSort],
    queryFn: async () => {
      const res = await getComments(
        { discussionId: discussionId! },
        { sort: selectedSort?.toLowerCase() as FindDiscussionCommentsSortOption }
      );
      return res.data;
    },
  });

  const likeDiscussionMutation = useMutation({
    mutationFn: (params: TLikeDiscussionParams) => likeDiscussion(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['discussions', discussionId],
      });
    },
  });

  const unlikeDiscussionMutation = useMutation({
    mutationFn: (params: TUnlikeDiscussionParams) => unlikeDiscussion(params),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['discussions', discussionId],
      });
    },
  });

  const createCommentForm = useForm<TCreateCommentRo>({
    initialValues: {
      discussionId: '',
      commentContent: '',
    },
    // validate: zod4Resolver(createCommentRoSchema),
  });

  const createCommentMutation = useMutation<void, Error, TCreateCommentRo>({
    mutationFn: (data) => createComments(data),
    onSuccess: (_, variables) => {
      notifications.show({
        message: `Your comment is posted successfully!`,
        color: 'green',
      });

      queryClient.invalidateQueries({
        queryKey: ['comments'],
      });

      createCommentForm.reset();
    },
    onError: () => {
      notifications.show({
        message: `Error: Your comment is failed to submit. Please try again.`,
        color: 'red',
      });
    },
  });

  async function onSubmit(data: TCreateCommentRo) {
    console.log('success');
    console.log(data);
    createCommentMutation.mutate({
      ...data,
      discussionId: discussion?.discussionId ?? '',
    });
  }

  async function handleReportConfirm() {
    if (!selectedReport) return;

    await reportDiscussion({ discussionId: selectedReport });

    handlers.close();
    setSelectedReport(null);
  }

  function handleLikeToggle() {
    if (!discussion?.discussionId) return;

    if (discussion.isLiked) {
      unlikeDiscussionMutation.mutate({
        discussionId: discussion.discussionId,
      });
    } else {
      likeDiscussionMutation.mutate({
        discussionId: discussion.discussionId,
      });
    }
  }

  return (
    <Stack align='center' py='sm'>
      <Flex direction='column' bg='white' bdrs='md' p='sm' gap={8} w={816}>
        {/* HEADER */}
        <Flex justify='space-between'>
          <Text fw={600}>{discussion?.discussionTitle}</Text>
        </Flex>

        {/* TAGS */}
        <Group gap={8} wrap='nowrap'>
          {(discussion?.interests ?? []).map((interest) => (
            <Badge
              key={interest.interestId}
              color='blue'
              size='sm'
              fw={600}
              style={{ textTransform: 'capitalize' }}>
              {interest.interestName}
            </Badge>
          ))}
          {(discussion?.goals ?? []).map((i) => (
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
        <Text size='sm'>{discussion?.discussionContent}</Text>

        {/* FOOTER */}
        <Group justify='space-between'>
          <Flex align='center' gap={12}>
            <Avatar src={discussion?.author.userAvatarUrl} />
            <Stack gap={0}>
              <Text size='sm'>{discussion?.author.userDisplayName}</Text>
              <Text size='xs' c='gray.6'>
                Posted {dayjs(discussion?.discussionCreatedTime).fromNow()}
              </Text>
            </Stack>
          </Flex>

          <Flex gap={12}>
            <Flex align='center' gap={4}>
              <Button
                variant='subtle'
                leftSection={<IconHeart size={16} />}
                loading={likeDiscussionMutation.isPending || unlikeDiscussionMutation.isPending}
                onClick={handleLikeToggle}
                color={discussion?.isLiked ? 'red' : 'black'}>
                {discussion?.likeCount}
              </Button>
            </Flex>
            <Flex align='center' gap={4}>
              <Button
                variant='light'
                color='red'
                radius='xl'
                leftSection={<IconFlag size={16} />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSelectedReport(discussion?.discussionId ?? null);
                  handlers.open();
                }}>
                Report
              </Button>
            </Flex>
          </Flex>
        </Group>
      </Flex>
      <Flex direction='column' bg='white' bdrs='md' p='sm' gap={8} w={816}>
        <Group justify='space-between'>
          <Text fw={700}>{discussion?.commentCount} Replies</Text>
          <Select
            value={selectedSort}
            onChange={setSelectedSort}
            data={Object.values(FindDiscussionCommentsSortOption).map(capitalizeFirstLetter)}
            radius='xl'
            w={125}
            rightSection={<IconChevronDown size={16} />}
          />
        </Group>

        <form onSubmit={createCommentForm.onSubmit(onSubmit)}>
          <Stack>
            <Group>
              <Avatar src={currentUser?.avatarUrl} size={36}></Avatar>
              <Input
                variant='filled'
                radius='md'
                placeholder='Input component'
                w={'740'}
                {...createCommentForm.getInputProps('commentContent')}
              />
            </Group>
            <Flex justify={'flex-end'}>
              <Button
                radius={'md'}
                w={'fit-content'}
                leftSection={<IconSend size={12} />}
                type='submit'
                p={'sm'}>
                Comment
              </Button>
            </Flex>
          </Stack>
        </form>

        <Flex direction={'column'} gap={'md'}>
          {comments?.comments?.map((comment) => (
            <CommentComponent
              comment={comment}
              key={comment.commentId}
              parentCommentAuthorName={null}
            />
          ))}
        </Flex>
      </Flex>

      <Modal
        opened={opened}
        onClose={handlers.close}
        title='Are you sure you want to report this discussion?'
        centered
        bdrs={'lg'}>
        <Flex justify='flex-end' gap='xs'>
          <Button
            variant='light'
            color='green'
            radius='xl'
            leftSection={<IconCheck size={16} />}
            onClick={handleReportConfirm}>
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
    </Stack>
  );
}
