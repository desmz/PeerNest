import {
  Anchor,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { envObj } from '@peernest/config/static';
import { signInRoSchema, TSignInRo } from '@peernest/contract';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useNavigate } from 'react-router';

import LogoImage from '@/assets/logo.svg';
import useAuth from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';
import { APP_ROUTE } from '@/lib/app-route';

import { GoogleButton } from './googleButton';

export default function SignInPage() {
  const navigate = useNavigate();
  const { signIn, googleAuthenticate, isLoading } = useAuth();
  useRedirectIfAuthenticated();

  const signInForm = useForm<TSignInRo>({
    initialValues: {
      email: '',
      password: '',
    },

    validate: zod4Resolver(signInRoSchema),
  });

  async function onSignInClick(data: TSignInRo) {
    await signIn(data);
  }

  async function onGoogleAuthenticateClick() {
    console.log('google click');
    await googleAuthenticate();
  }

  return (
    <Box bg={'gray.1'} h={'100vh'}>
      <Card radius={16} p='lg' w={580} mx={'auto'} top={100} withBorder shadow='sm'>
        <Image
          alt='PeerNest Logo'
          width={48}
          height={48}
          src={LogoImage}
          fit='contain'
          style={{ width: 'auto' }}
        />
        <Text fz={'h3'} fw={700} mx={'auto'}>
          Welcome to{' '}
          <Text component='span' inherit c={'blue'}>
            {envObj.BRAND_NAME},{' '}
          </Text>
          sign in with
        </Text>

        <Group grow mb='md' mt='md'>
          <GoogleButton radius='xl' onClick={onGoogleAuthenticateClick} disabled={isLoading}>
            Google
          </GoogleButton>
        </Group>

        <Divider label='Or continue with email' labelPosition='center' />

        <form onSubmit={signInForm.onSubmit(onSignInClick)}>
          <Stack gap={'md'}>
            <TextInput
              required
              label='Email'
              placeholder='Your email'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signInForm.key('email')}
              {...signInForm.getInputProps('email')}
            />

            <PasswordInput
              required
              label='Password'
              placeholder='Your password'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signInForm.key('password')}
              {...signInForm.getInputProps('password')}
            />
          </Stack>

          <Group justify='space-between' mt='xl'>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              size='xs'
              onClick={() => navigate(APP_ROUTE.SIGN_UP)}>
              Don't have an account? Register
            </Anchor>
            <Group>
              <Anchor
                component='button'
                type='button'
                c='dimmed'
                size='xs'
                onClick={() => navigate(APP_ROUTE.FORGET_PASSWORD)}>
                Forgot Password?
              </Anchor>

              <Button type='submit' radius='xl' disabled={isLoading}>
                Sign In
              </Button>
            </Group>
          </Group>
        </form>
      </Card>
    </Box>
  );
}
