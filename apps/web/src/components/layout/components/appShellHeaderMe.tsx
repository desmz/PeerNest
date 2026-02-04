import { Flex, NavLink, NavLinkProps } from '@mantine/core';
import { useNavigate } from 'react-router';

import { APP_ROUTE } from '@/lib/app-route';

const navigationItems: (NavLinkProps & { href: string })[] = [
  {
    label: 'Profile',
    href: APP_ROUTE.USER_ME,
  },
  {
    label: 'Discussions',
    href: APP_ROUTE.PROFILE_DISCUSSION_POST,
  },
  {
    label: 'Mood & Wellness',
    href: APP_ROUTE.WELLNESS,
  },
  {
    label: 'Achievements',
    href: APP_ROUTE.ACHIEVEMENTS,
  },
];

export default function AppShellHeaderMe() {
  const navigate = useNavigate();

  return (
    <Flex w={'100%'} gap={'md'}>
      {navigationItems.map((navItem, idx) => {
        return (
          <NavLink
            w={'fit-content'}
            href={navItem.href}
            key={idx}
            label={navItem.label}
            onClick={(e) => {
              e.preventDefault();
              navigate(navItem.href);
            }}
          />
        );
      })}
    </Flex>
  );
}
