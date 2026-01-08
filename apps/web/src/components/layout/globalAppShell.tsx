import { Anchor, AppShell, Burger, Group, Image, NavLink, ScrollArea, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Link } from 'react-router';

import logoImage from '@/assets/logo.svg';

type TGlobalAppShellProps = {
  children: React.ReactNode;
};

export default function GlobalAppShell({ children }: TGlobalAppShellProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding='md'>
      <AppShell.Header>
        <Group h='100%' px='md'>
          <Burger opened={opened} onClick={toggle} hiddenFrom='sm' size='sm' />
          <Anchor component={Link} to='/home' style={{ textDecoration: 'none' }}>
            <Group align='center' gap='12' justify='center'>
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
