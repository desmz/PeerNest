import { Button, Container, Image, SimpleGrid, Text, Title } from '@mantine/core';
import { Link } from 'react-router';

import banImage from '@/assets/banned.svg';

import classes from './banPage.module.css';

export default function BanPage() {
  return (
    <Container className={classes.root}>
      <SimpleGrid spacing={{ base: 40, sm: 80 }} cols={{ base: 2, sm: 2 }}>
        <Image src={banImage} className={classes.mobileImage} />
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
            to={'/auth'}>
            Get back to login page
          </Button>
        </div>
        <Image src={banImage} className={classes.desktopImage} />
      </SimpleGrid>
    </Container>
  );
}
