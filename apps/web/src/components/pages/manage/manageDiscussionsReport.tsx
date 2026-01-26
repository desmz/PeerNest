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
  DELETE_REPORTED_CONTENT_URL,
  FIND_REPORTED_CONTENTS_URL,
  RELEASE_REPORTED_CONTENT_URL,
  TDeleteReportedContentParams,
  TFindReportedContentsQueryParams,
  TFindReportedContentsVo,
  TReleaseReportedContentParams,
  urlBuilder,
} from '@peernest/contract';
import {
  dayjs,
  FindReportedContentsSortOption,
  FindReportedContentsTypeOption,
} from '@peernest/core';
import { IconCheck, IconChevronDown, IconTrash, IconX } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import React from 'react';

import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';
import { queryClient } from '@/main';

async function getReports(queryParams: TFindReportedContentsQueryParams) {
  const url = buildQueryParamsUrl(FIND_REPORTED_CONTENTS_URL, queryParams);
  return api.get<TFindReportedContentsVo>(url);
}

async function deleteReports(params: TDeleteReportedContentParams) {
  const url = urlBuilder(DELETE_REPORTED_CONTENT_URL, params);
  return api.post<void>(url);
}

async function releaseReports(params: TReleaseReportedContentParams) {
  const url = urlBuilder(RELEASE_REPORTED_CONTENT_URL, params);
  return api.post<void>(url);
}

export default function ManageDiscussionsReport() {
  const [selectedSort, setSelectedSort] = React.useState<string | null>(
    capitalizeFirstLetter(FindReportedContentsSortOption.Newest)
  );

  const [selectedType, setSelectedType] = React.useState<string | null>(
    capitalizeFirstLetter(FindReportedContentsTypeOption.Discussion)
  );

  const [opened, handlers] = useDisclosure(false);
  const [selectedDeleteId, setSelectedDeleteId] = React.useState<string | null>(null);
  const [open, handle] = useDisclosure(false);
  const [selectedReleaseId, setSelectedReleaseId] = React.useState<string | null>(null);

  async function handleDeleteConfirm() {
    if (!selectedDeleteId) return;

    await deleteReports({ reportId: selectedDeleteId });
    console.log(selectedDeleteId);

    handlers.close();
    setSelectedDeleteId(null);

    queryClient.invalidateQueries({ queryKey: ['reports'] });
  }

  async function handleReleaseConfirm() {
    if (!selectedReleaseId) return;

    await releaseReports({ reportId: selectedReleaseId });
    console.log(selectedReleaseId);

    handle.close();
    setSelectedReleaseId(null);

    queryClient.invalidateQueries({ queryKey: ['reports'] });
  }

  const { data: reportData } = useQuery({
    queryKey: ['reports', selectedSort, selectedType],
    queryFn: async () => {
      const res = await getReports({
        sort: selectedSort?.toLowerCase() as FindReportedContentsSortOption,
        type: selectedType?.toLowerCase() as FindReportedContentsTypeOption,
      });
      return res.data;
    },
  });

  return (
    <Flex direction='column' bg='gray.1' align='center'>
      <Flex w={816} pt='xs' justify='flex-end' gap={8}>
        <Select
          value={selectedType}
          onChange={setSelectedType}
          data={Object.values(FindReportedContentsTypeOption).map(capitalizeFirstLetter)}
          radius='xl'
          w={125}
          rightSection={<IconChevronDown size={16} />}
        />
        <Select
          value={selectedSort}
          onChange={setSelectedSort}
          data={Object.values(FindReportedContentsSortOption).map(capitalizeFirstLetter)}
          radius='xl'
          w={125}
          rightSection={<IconChevronDown size={16} />}
        />
      </Flex>

      <Stack align='center' py='sm'>
        {reportData?.reportedContents?.map((report) =>
          report.type === FindReportedContentsTypeOption.Discussion ? (
            <Anchor
              key={report.reportId}
              href={`${APP_ROUTE.DISCUSSION}/${'discussionId' in report.target ? report.target.discussionId : report.target.discussion?.discussionId}`}
              underline='never'
              c='black'>
              <Flex direction='column' bg='white' bdrs='md' p='sm' gap={8} w={816}>
                <Flex justify='space-between' c={'red'}>
                  <Text fw={600} size='xs'>
                    By: {report.reporter.userDisplayName}
                  </Text>
                </Flex>
                {/* HEADER */}
                <Flex justify='space-between'>
                  <Text fw={600}>
                    {'discussionId' in report.target
                      ? report.target.discussionTitle
                      : report.target.discussion?.discussionTitle}
                  </Text>

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
                        setSelectedReleaseId(report.reportId);
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
                        setSelectedDeleteId(report.reportId);
                        handlers.open();
                      }}>
                      Delete
                    </Button>
                  </Flex>
                </Flex>

                {/* TAGS */}
                <Group gap={8} wrap='nowrap'>
                  {('interests' in report.target ? (report.target.interests ?? []) : []).map(
                    (interest) => (
                      <Badge
                        key={interest.interestId}
                        color='blue'
                        size='sm'
                        fw={600}
                        style={{ textTransform: 'capitalize' }}>
                        {interest.interestName}
                      </Badge>
                    )
                  )}
                  {('interests' in report.target ? (report.target.goals ?? []) : []).map((goal) => (
                    <Badge
                      key={goal.personalGoalId}
                      color='green'
                      size='sm'
                      fw={600}
                      style={{ textTransform: 'capitalize' }}>
                      {goal.personalGoalTitle}
                    </Badge>
                  ))}
                </Group>

                {/* CONTENT */}
                <Text size='sm'>
                  {'discussionContent' in report.target
                    ? report.target.discussionContent
                    : report.target.commentContent}
                </Text>

                {/* FOOTER */}
                <Group justify='space-between'>
                  <Flex align='center' gap={12}>
                    <Avatar src={report.target.author.userAvatarUrl} />
                    <Stack gap={0}>
                      <Text size='sm'>{report.target.author.userDisplayName}</Text>
                      <Text size='xs' c='gray.6'>
                        Posted{' '}
                        {dayjs(
                          'discussionCreatedTime' in report.target
                            ? report.target.discussionCreatedTime
                            : (report.target.commentCreatedTime ?? '')
                        ).fromNow()}
                      </Text>
                    </Stack>
                  </Flex>
                </Group>
              </Flex>
            </Anchor>
          ) : (
            <Anchor key={report.reportId} href={APP_ROUTE.HOME} underline='never' c='black'>
              <Flex direction='column' bg='white' bdrs='md' p='xs' gap={8} w={816}>
                {/* HEADER */}
                <Flex justify='space-between'>
                  <Text fw={600}>
                    {'discussionTitle' in report.target
                      ? report.target.discussionTitle
                      : report.target.discussion?.discussionTitle}
                  </Text>
                </Flex>

                {/* FOOTER */}
                <Divider my='xs' />
                <Flex>
                  <Stack align='top'>
                    <Group justify='space-between'>
                      <Flex c={'red'} align={'top'}>
                        <Text fw={600} size='xs'>
                          By: {report.reporter.userDisplayName}
                        </Text>
                      </Flex>
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
                            setSelectedReleaseId(report.reportId);
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
                            setSelectedDeleteId(report.reportId);
                            handlers.open();
                          }}>
                          Delete
                        </Button>
                      </Flex>
                    </Group>
                    <Avatar src={report.target.author.userAvatarUrl}></Avatar>
                    <Stack gap={0}>
                      <Text size='sm' fw={700}>
                        {report.target.author.userDisplayName}
                      </Text>
                      <Text size='xs' c='gray.6'>
                        Posted{' '}
                        {dayjs(
                          'commentCreatedTime' in report.target
                            ? report.target.commentCreatedTime
                            : (report.target.discussionCreatedTime ?? '')
                        ).fromNow()}
                      </Text>
                      <Text size='sm' pt={'sm'}>
                        {'discussionContent' in report.target
                          ? report.target.discussionContent
                          : report.target.commentContent}
                      </Text>
                    </Stack>
                  </Stack>
                </Flex>
              </Flex>
            </Anchor>
          )
        )}
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
