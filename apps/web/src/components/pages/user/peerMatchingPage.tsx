import { Avatar, Badge, Box, Button, Flex, Group, Paper, Stack, Text } from '@mantine/core';
import { UserRole } from '@peernest/core';
import { IconAddressBook } from '@tabler/icons-react';
import { Link } from 'react-router';

import { useFindUsers } from '@/features/user/hooks/use-find-users';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

import classes from './peerMatchingPage.module.css';

export default function PeerMatchingPage() {
  const usersQuery = useFindUsers();

  if (usersQuery.isPending) return <Text>Loading…</Text>;

  if (usersQuery.isError) {
    const msg =
      usersQuery.error instanceof Error ? usersQuery.error.message : String(usersQuery.error);
    return <Text c='red'>An error has occurred: {msg}</Text>;
  }

  const users = usersQuery.data?.users ?? [];

  return (
    <Box className={classes.page}>
      {/* Top filter bar */}
      <Group
        justify='space-between'
        align='center'
        wrap='nowrap'
        className={classes.filterRow}></Group>

      {/* User cards */}
      <Stack gap='md' mt='md' maw={'80%'} mx={'auto'} miw={680}>
        {users.map((user) => {
          const interests = user.interests ?? [];
          const goals = user.personalGoals ?? [];

          const subtitlesArr: string[] = [];

          if (user.pronoun?.pronounName)
            subtitlesArr.push(capitalizeFirstLetter(user.pronoun.pronounName));
          if (user.university?.universityName)
            subtitlesArr.push(capitalizeFirstLetter(user.university.universityName));
          if (user.domain?.domainName)
            subtitlesArr.push(capitalizeFirstLetter(user.domain.domainName));

          const subtitles = subtitlesArr.join(' · ');

          const badgeItems = [
            ...interests.map((i) => ({
              key: i.interestId,
              label: i.interestName,
              color: 'blue' as const,
            })),
            ...goals.map((g) => ({
              key: g.personalGoalId,
              label: g.personalGoalTitle,
              color: 'green' as const,
            })),
          ].slice(0, 4);

          return (
            <Paper key={user.userId} className={classes.card} radius='md' p='md'>
              <Group wrap='nowrap' align='flex-start' className={classes.cardRow}>
                <Avatar
                  src={user.userAvatarUrl}
                  size={56}
                  radius='xl'
                  className={classes.userAvatar}
                />

                <Box className={classes.main}>
                  <Flex gap={8} align={'center'}>
                    <Text fw={700} className={classes.name}>
                      {user.userDisplayName}
                    </Text>
                    {user.roleName && user.roleName !== UserRole.User && (
                      <Badge color='yellow' size='xs' style={{ textTransform: 'capitalize' }}>
                        {capitalizeFirstLetter(user.roleName)}
                      </Badge>
                    )}
                  </Flex>

                  <Text size='xs' c='dimmed' className={classes.subtitle}>
                    {subtitles}
                  </Text>

                  <Group gap={8} mt={8} wrap='nowrap' className={classes.badgesOneLine}>
                    {badgeItems.map((b) => (
                      <Badge
                        key={b.key}
                        color={b.color}
                        size='xs'
                        style={{ textTransform: 'capitalize' }}
                        fw='400'>
                        {b.label}
                      </Badge>
                    ))}
                  </Group>

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

                      {/* <Button
                        variant='light'
                        color='blue'
                        radius='md'
                        size='sm'
                        px={12}
                        leftSection={<IconUserPlus size={14} />}
                        className={classes.actionBtn}
                        bd={'1px solid blue'}>
                        Send Request
                      </Button> */}
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
