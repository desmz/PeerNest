import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Group,
  Kbd,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { FIND_USERS_URL, type TFindUsersVo } from '@peernest/contract';
import {
  IconAddressBook,
  IconBell,
  IconChevronDown,
  IconSearch,
  IconUserPlus,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';

import classes from './peerMatchingPage.module.css';

export async function findUsers() {
  return await api.get<TFindUsersVo>(FIND_USERS_URL);
}

function capitalizeFirstLetter(str: string) {
  if (!str) return ''; // Handle empty or null strings
  return str
    .split(' ')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

export default function PeerMatchingPage() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<TFindUsersVo> => {
      const res = await findUsers();
      return res.data;
    },
  });

  if (query.isPending) return <Text>Loading…</Text>;

  if (query.isError) {
    const msg = query.error instanceof Error ? query.error.message : String(query.error);
    return <Text c='red'>An error has occurred: {msg}</Text>;
  }

  const users = query.data?.users ?? [];

  // Replace with your real logged-in user avatar URL when available
  const currentUserAvatarUrl =
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=128&q=80';

  return (
    <Box className={classes.page}>
      {/* Top filter bar */}
      <Paper className={classes.filterBar} radius='md' p='md'>
        <Group justify='space-between' align='center' wrap='nowrap' className={classes.filterRow}>
          {/* Left: selects */}
          <Group gap='md' wrap='nowrap' className={classes.filterLeft}>
            <Select
              placeholder='Interests'
              data={[]}
              w={220}
              rightSection={<IconChevronDown size={16} />}
              rightSectionPointerEvents='none'
              className={classes.selectOneChevron}
            />
            <Select
              placeholder='Goals'
              data={[]}
              w={220}
              rightSection={<IconChevronDown size={16} />}
              rightSectionPointerEvents='none'
              className={classes.selectOneChevron}
            />
          </Group>

          {/* Right: search + icons */}
          <Group gap={10} wrap='nowrap' className={classes.filterRight}>
            <TextInput
              className={classes.search}
              leftSection={<IconSearch size={16} />}
              placeholder='Search User'
              w={320}
              rightSectionWidth={90}
              rightSection={
                <Kbd className={classes.kbdSingle}>
                  Ctrl <span className={classes.kbdPlus}>+</span> K
                </Kbd>
              }
            />

            <ActionIcon
              variant='subtle'
              radius='xl'
              size={36}
              aria-label='Notifications'
              className={classes.topIcon}>
              <IconBell size={20} />
            </ActionIcon>

            <Avatar
              src={currentUserAvatarUrl}
              radius={100}
              size={36}
              className={classes.topAvatar}
            />
          </Group>
        </Group>
      </Paper>

      {/* User cards */}
      <Stack gap='md' mt='md'>
        {users.map((user) => {
          const interests = user.interests ?? [];
          const goals = user.personalGoals ?? [];

          const subtitlesArr: string[] = [];

          if (user.pronoun?.pronounName) {
            subtitlesArr.push(capitalizeFirstLetter(user.pronoun?.pronounName));
          }

          if (user.university?.universityName) {
            subtitlesArr.push(capitalizeFirstLetter(user.university?.universityName));
          }

          if (user.domain?.domainName) {
            subtitlesArr.push(capitalizeFirstLetter(user.domain.domainName));
          }

          const subtitles = subtitlesArr.join(' · ');

          // cap to 4 TOTAL badges to match Figma
          const badgeItems = [
            ...interests.map((i) => ({
              key: `i-${i.interestId}`,
              label: i.interestName,
              color: 'blue' as const,
            })),
            ...goals.map((g) => ({
              key: `g-${g.personalGoalId}`,
              label: g.personalGoalName,
              color: 'green' as const,
            })),
          ].slice(0, 4);

          return (
            <Paper key={user.userId} className={classes.card} radius='md' p='md'>
              <Group wrap='nowrap' align='flex-start' className={classes.cardRow}>
                {/* Avatar */}
                <Avatar
                  src={user.userAvatarUrl}
                  size={56}
                  radius='xl'
                  className={classes.userAvatar}
                />

                {/* Main content */}
                <Box className={classes.main}>
                  <Text fw={700} className={classes.name}>
                    {user.userDisplayName}
                  </Text>

                  <Text size='xs' c='dimmed' className={classes.subtitle}>
                    {subtitles}
                  </Text>

                  {/* Badges: smaller, one line, truncated */}
                  <Group gap={8} mt={8} wrap='nowrap' className={classes.badgesOneLine}>
                    {badgeItems.map((b) => (
                      <Badge
                        color={b.color}
                        size='xs'
                        style={{ textTransform: 'capitalize' }}
                        fw='400'>
                        {b.label}
                      </Badge>
                    ))}
                  </Group>

                  {/* Bottom row: lookingFor (left) + actions (right) */}
                  <Group justify='space-between' align='center' mt={12} wrap='nowrap'>
                    <Text size='sm' className={classes.lookingFor}>
                      {user.userInfoLookingFor ?? ''}
                    </Text>

                    <Group gap={10} wrap='nowrap' className={classes.actions}>
                      <Button
                        variant='light'
                        color='yellow.6'
                        radius='md'
                        size='sm'
                        px={12}
                        leftSection={<IconAddressBook size={14} />}
                        className={classes.actionBtn}
                        bd={'1px solid yellow.6'}
                        component={Link}
                        to={`${APP_ROUTE.USER}/${user.userId}`}>
                        View Profile
                      </Button>

                      <Button
                        variant='light'
                        color='blue'
                        radius='md'
                        size='sm'
                        px={12}
                        leftSection={<IconUserPlus size={14} />}
                        className={classes.actionBtn}
                        bd={'1px solid blue'}>
                        Send Request
                      </Button>
                    </Group>
                  </Group>
                </Box>
              </Group>
            </Paper>
          );
        })}
      </Stack>
    </Box>
  );
}
