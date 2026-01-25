import {
  Anchor,
  AppShell,
  Avatar,
  Burger,
  Flex,
  Group,
  Image,
  NavLink,
  ScrollArea,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import logoImage from '@/assets/logo.svg';
import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import { APP_ROUTE } from '@/lib/app-route';

import AppShellHeaderPeerMatching from './components/appShellHeaderPeerMatching';

type TGlobalAppShellProps = {
  children: React.ReactNode;
};

const headerMap = {
  [APP_ROUTE.USER]: <AppShellHeaderPeerMatching />,
};

export default function GlobalAppShell({ children }: TGlobalAppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const [currentUser] = useAtom(currentUserAtom);
  const location = useLocation();
  const [headerComponent, setHeaderComponent] = useState<React.ReactNode>(null);

  useEffect(() => {
    setHeaderComponent(headerMap[location.pathname]);
  }, [location]);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding='md'>
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Flex justify={'space-between'} w={'100%'} align={'center'} pr={8} gap={40}>
            <Anchor component={Link} to='/home' style={{ textDecoration: 'none' }}>
              <Group align='center' gap='12' miw={200}>
                <Image
                  alt='PeerNest Logo'
                  width={36}
                  height={36}
                  src={logoImage}
                  fit='contain'
                  style={{ width: 'auto' }}
                />
                <Title size='h3' fw={600} style={{ cursor: 'pointer', userSelect: 'none' }}>
                  PeerNest
                </Title>
              </Group>
            </Anchor>

            {/* right section */}
            <Flex gap={12} wrap='nowrap' w={headerComponent ? '100%' : 'auto'}>
              {!!headerComponent && headerComponent}

              {/* <ActionIcon
                variant='subtle'
                radius='xl'
                size={36}
                aria-label='Notifications'
                className={classes.topIcon}>
                <IconBell size={20} />
              </ActionIcon> */}
              <Avatar src={currentUser?.avatarUrl} radius={100} size={36} />
            </Flex>
          </Flex>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section pt='lg' grow my='md' component={ScrollArea} px='md'>
          {Array(10)
            .fill(0)
            .map((_, index) => (
              <NavLink
                href='#'
                key={index}
                onClick={(event) => event.preventDefault()}
                label='Navbar link'
              />
            ))}
        </AppShell.Section>
        <AppShell.Section p='md'>Navbar footer - always at the bottom</AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main bg='gray.1'>{children}</AppShell.Main>
    </AppShell>
  );
}
