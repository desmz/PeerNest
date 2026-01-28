import type { TFindUsersVo } from '@peernest/contract';
import type { NavigateFunction } from 'react-router';

import { Avatar } from '@mantine/core';

import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

export function buildUserSpotlightActions(
  users: TFindUsersVo['users'],
  navigate: NavigateFunction
) {
  return users.map((user) => {
    const subtitles: string[] = [];

    if (user.pronoun?.pronounName) subtitles.push(capitalizeFirstLetter(user.pronoun.pronounName));
    if (user.university?.universityName)
      subtitles.push(capitalizeFirstLetter(user.university.universityName));
    if (user.domain?.domainName) subtitles.push(capitalizeFirstLetter(user.domain.domainName));

    return {
      id: user.userId,
      label: user.userDisplayName,
      description: subtitles.join(' · '),
      leftSection: <Avatar src={user.userAvatarUrl} size={56} radius='xl' />,
      onClick: () => navigate(`${APP_ROUTE.USER}/${user.userId}`),
    };
  });
}
