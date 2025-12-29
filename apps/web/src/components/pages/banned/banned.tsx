import { Button, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import bannedimage from '@/assets/banned.svg';
import useAuth from '@/features/auth/hooks/use-auth';

import classes from './banned.module.css';

export default function Banned() {
  const { signOut, isLoading } = useAuth();

  async function onSignOutClick() {
    await signOut();
  }

  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 2, sm: 2 }}>
        <Image src={bannedimage} className={classes.mobileImage} />
        <div>
          <Title className={classes.title}>Access denied...</Title>
          <Text c='dimmed' size='lg'>
            Your account is suspended due to guideline violations. You cannot access PeerNest at
            this time.
          </Text>
          <Button
            variant='outline'
            size='md'
            mt='xl'
            className={classes.control}
            component={Link}
            to={'/auth'}
            onClick={onSignOutClick}
            disabled={isLoading}>
            Get back to login page
          </Button>
        </div>
        <Image src={bannedimage} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}
