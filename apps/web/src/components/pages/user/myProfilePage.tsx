import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { GET_ME_PROFILE_URL, type TGetMeProfileVo } from '@peernest/contract';
import { UserRole } from '@peernest/core';
import { IconEdit, IconLock, IconMail } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { Link } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

export async function getMeProfile() {
  return await api.get<TGetMeProfileVo>(GET_ME_PROFILE_URL);
}

export default function MyProfilePage() {
  const [currentUser] = useAtom(currentUserAtom);

  const query = useQuery({
    queryKey: ['users', 'me', 'profile'],
    queryFn: async () => (await getMeProfile()).data,
  });

  if (query.isPending) return <Text>Loading…</Text>;
  if (query.isError) return <Text c='red'>Failed to load profile.</Text>;

  const me = query.data;

  const subtitle = [me.pronoun?.pronounName, me.university?.universityName, me.domain?.domainName]
    .filter(Boolean)
    .map((s) => capitalizeFirstLetter(String(s)))
    .join(' · ');

  return (
    <Box>
      <Flex maw='70%' mx='auto' py={24} direction='column'>
        {/* Header card (avatar + name + buttons) */}
        <Paper radius='md' p={16} mb={16}>
          <Group align='center' gap={16} wrap='nowrap'>
            <Avatar src={currentUser?.avatarUrl} size='xl' radius={100} />

            <Flex direction='column' gap={12} style={{ flex: 1 }}>
              <div>
                <Flex gap={8} align={'center'}>
                  <Title order={4}>{currentUser?.displayName}</Title>
                  {currentUser?.role && currentUser.role !== UserRole.User && (
                    <Badge color='yellow' size='xs' style={{ textTransform: 'capitalize' }}>
                      {capitalizeFirstLetter(currentUser.role)}
                    </Badge>
                  )}
                </Flex>
                <Text size='xs' c='dimmed' mt={4}>
                  {subtitle}
                </Text>
              </div>

              <Group gap={12}>
                <Button
                  leftSection={<IconEdit size={16} />}
                  radius='md'
                  size='sm'
                  component={Link}
                  to={`${APP_ROUTE.USER_ME}/edit`}>
                  Edit Profile
                </Button>

                <Button leftSection={<IconLock size={16} />} radius='md' size='sm'>
                  Change Password
                </Button>
              </Group>
            </Flex>
          </Group>
        </Paper>

        {/* Info card */}
        <Paper radius={10} p={16} mb={24}>
          <Grid gutter={16}>
            {/* Email row */}
            <Grid.Col span={6}>
              <Text fw={600}>Email</Text>
              <Text mt={6}>{currentUser?.email ?? '—'}</Text>
            </Grid.Col>

            <Grid.Col span={6}>
              <Flex align='flex-end' h={56}>
                <Button leftSection={<IconMail size={16} />} radius='md' size='sm'>
                  Change Email
                </Button>
              </Flex>
            </Grid.Col>

            {/* Display Name */}
            <Grid.Col span={6}>
              <Text fw={600}>Display Name</Text>
              <Text mt={6}>{me.userDisplayName ?? '—'}</Text>
            </Grid.Col>

            {/* Pronoun */}
            <Grid.Col span={6}>
              <Text fw={600}>Pronoun</Text>
              <Text mt={6}>
                {me.pronoun?.pronounName ? capitalizeFirstLetter(me.pronoun.pronounName) : '—'}
              </Text>
            </Grid.Col>

            {/* University */}
            <Grid.Col span={6}>
              <Text fw={600}>University/College</Text>
              <Text mt={6}>
                {me.university?.universityName
                  ? capitalizeFirstLetter(me.university.universityName)
                  : '—'}
              </Text>
            </Grid.Col>

            {/* Major */}
            <Grid.Col span={6}>
              <Text fw={600}>Major/Domain</Text>
              <Text mt={6}>
                {me.domain?.domainName ? capitalizeFirstLetter(me.domain.domainName) : '—'}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Existing Details card */}
        <Paper radius='md' p={16}>
          <Stack gap={16}>
            <Box>
              <Title order={5}>About</Title>
              <Text mt={4}>{me.userInfoBio ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Looking For</Title>
              <Text mt={4}>{me.userInfoLookingFor ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Interests</Title>
              <Group mt={6} gap={8} wrap='wrap'>
                {(me.interests ?? []).map((i) => (
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
                {(me.personalGoals ?? []).map((g) => (
                  <Badge
                    key={g.personalGoalId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {g.personalGoalName}
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
