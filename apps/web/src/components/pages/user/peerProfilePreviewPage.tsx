import { Avatar, Badge, Box, Button, Flex, Group, Paper, Stack, Text, Title } from '@mantine/core';
import { GET_USER_PROFILE_URL, type TGetUserProfileVo, urlBuilder } from '@peernest/contract';
import { UserRole } from '@peernest/core';
import { IconArrowBigUpLine, IconHammer } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { useParams } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { capitalizeFirstLetter } from '@/lib/util';

export async function getUserProfile(userId: string) {
  const url = urlBuilder(GET_USER_PROFILE_URL, { userId });
  return await api.get<TGetUserProfileVo>(url);
}

function capitalizeWords(str: string) {
  if (!str) return '';
  return str
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export default function PeerProfilePreviewPage() {
  const [currentUser] = useAtom(currentUserAtom);

  const { userId } = useParams<{ userId: string }>();

  const query = useQuery({
    queryKey: ['users', userId, 'profile'],
    enabled: !!userId,
    queryFn: async () => (await getUserProfile(userId!)).data,
  });

  if (!userId) return <Text c='red'>Missing userId.</Text>;
  if (query.isPending) return <Text>Loading…</Text>;
  if (query.isError) return <Text c='red'>Failed to load profile.</Text>;

  const userData = query.data;

  const subtitle = [
    userData.pronoun?.pronounName,
    userData.university?.universityName,
    userData.domain?.domainName,
  ]
    .filter(Boolean)
    .map((s) => capitalizeWords(String(s)))
    .join(' · ');

  return (
    <Box>
      {/* Main content */}
      <Flex maw={'70%'} mx='auto' py={24} direction={'column'}>
        {/* Header card */}
        <Paper radius='md' p={16} mb={16}>
          <Group align='flex-start' gap={16} wrap='nowrap'>
            <Avatar src={userData.userAvatarUrl} size={'xl'} radius={100} />

            <Flex pt={6} direction={'column'} gap={12}>
              <Flex>
                <Flex gap={8} align={'center'}>
                  <Title order={4}>{userData.userDisplayName}</Title>
                  {userData.roleName && userData.roleName !== UserRole.User && (
                    <Badge color='yellow' size='xs' style={{ textTransform: 'capitalize' }}>
                      {capitalizeFirstLetter(userData.roleName)}
                    </Badge>
                  )}
                </Flex>
                <Text size='xs' c='dimmed' mt={4}>
                  {subtitle}
                </Text>
              </Flex>
              <Flex gap={16}>
                {/* <Button radius='md' size='sm' w={'fit-content'}>
                  Send Request
                </Button> */}
                {currentUser && currentUser.role === UserRole.Admin ? (
                  <>
                    <Button
                      radius='md'
                      size='sm'
                      w={'fit-content'}
                      leftSection={<IconArrowBigUpLine size={16} stroke={2.5} />}>
                      Promote as...
                    </Button>
                    <Button
                      variant='light'
                      color='red.9'
                      radius='md'
                      size='sm'
                      fw={600}
                      w={'fit-content'}
                      leftSection={<IconHammer size={16} stroke={3} />}>
                      Ban
                    </Button>
                  </>
                ) : null}
              </Flex>
            </Flex>
          </Group>
        </Paper>

        {/* Details */}
        <Paper radius='md' p={16}>
          <Stack gap={16}>
            <Box>
              <Title order={5}>About</Title>
              <Text mt={4}>{userData.userInfoBio ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Looking For</Title>
              <Text mt={4}>{userData.userInfoLookingFor ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Interests</Title>

              <Group mt={6} gap={8} wrap='wrap'>
                {(userData.interests ?? []).map((i) => (
                  <Badge
                    key={i.interestId}
                    color='green'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {i.interestName}
                  </Badge>
                ))}
              </Group>
            </Box>

            <Box>
              <Title order={5}>Personal Goals</Title>
              <Group mt={6} gap={8} wrap='wrap'>
                {(userData.personalGoals ?? []).map((g) => (
                  <Badge
                    key={g.personalGoalId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {g.personalGoalTitle}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Stack>
        </Paper>
      </Flex>
    </Box>
  );
}
