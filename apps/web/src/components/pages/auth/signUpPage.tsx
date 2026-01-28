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
import { signUpRoSchema, TSignUpRo } from '@peernest/contract';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useNavigate } from 'react-router';

import LogoImage from '@/assets/logo.svg';
import useAuth from '@/features/auth/hooks/use-auth';
import { APP_ROUTE } from '@/lib/app-route';

import { GoogleButton } from './googleButton';

export default function SignUpPage() {
  const navigate = useNavigate();
  const { signUp, googleAuthenticate, isLoading } = useAuth();

  const signUpForm = useForm<TSignUpRo>({
    initialValues: {
      email: '',
      displayName: '',
      password: '',
      confirmPassword: '',
    },

    validate: zod4Resolver(signUpRoSchema),
  });

  async function onSignUpClick(data: TSignUpRo) {
    await signUp(data);
  }

  async function onGoogleAuthenticateClick() {
    await googleAuthenticate();
  }

  return (
    <Box bg={'gray.1'} h={'100vh'}>
      <Card radius={16} p='lg' w={580} mx={'auto'} top={50} withBorder shadow='sm'>
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
          register with
        </Text>

        <Group grow mb='md' mt='md'>
          <GoogleButton radius='xl' onClick={onGoogleAuthenticateClick} disabled={isLoading}>
            Google
          </GoogleButton>
        </Group>

        <Divider label='Or continue with email' labelPosition='center' />

        <form onSubmit={signUpForm.onSubmit(onSignUpClick)}>
          <Stack gap={'md'}>
            <TextInput
              required
              label='Display Name'
              placeholder='Your name'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signUpForm.key('displayName')}
              {...signUpForm.getInputProps('displayName')}
            />

            <TextInput
              required
              label='Email'
              placeholder='Your email'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signUpForm.key('email')}
              {...signUpForm.getInputProps('email')}
            />

            <PasswordInput
              required
              label='Password'
              placeholder='Password'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signUpForm.key('password')}
              {...signUpForm.getInputProps('password')}
            />
            <PasswordInput
              required
              label='Confirm Password'
              placeholder='Confirm password'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={signUpForm.key('confirmPassword')}
              {...signUpForm.getInputProps('confirmPassword')}
            />
          </Stack>

          <Group justify='space-between' mt='xl'>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              size='xs'
              onClick={() => navigate(APP_ROUTE.SIGN_IN)}>
              Have an account? Login
            </Anchor>
            <Group>
              <Button type='submit' radius='xl' disabled={isLoading}>
                Register
              </Button>
            </Group>
          </Group>
        </form>
      </Card>
    </Box>
  );
}
