import {
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { upperFirst, useToggle } from '@mantine/hooks';
// import { envObj } from '@peernest/config/static';
// import { TSignInRo, TSignUpRo } from '@peernest/contract';
// import { Helmet } from 'react-helmet-async';
// import { TSignInRo } from '@peernest/contract';

// import useAuth from '@/features/auth/hooks/use-auth';
import { useRedirectIfAuthenticated } from '@/features/auth/hooks/use-redirect-if-authenticated';

import { GoogleButton } from './googleButton';

export default function SignInPage() {
  // const { signIn, signUp, googleAuthenticate, isLoading } = useAuth();
  // const { signUp } = useAuth();
  useRedirectIfAuthenticated();

  // const signInData: TSignInRo = {
  // email: 'lalelilolu7729@gmail.com',
  // password: 'PeerNest!6214',
  // email: 'testuser3@gmail.com',
  // password: '!Password13',
  // email: 'testuser1@gmail.com',
  // password: '!Password1',
  // };

  // const signUpData: TSignUpRo = {
  //   ...signInData,
  //   displayName: 'Alex Bob',
  //   confirmPassword: 'PeerNest!6214',
  // };

  // async function onSignUpClick() {
  //   await signUp(signUpData);
  // }

  // async function onSignInClick() {
  //   await signIn(signInData);
  // }

  // async function onGoogleAuthenticateClick() {
  //   await googleAuthenticate();
  // }

  // <>
  //   <Helmet>
  //     <title>
  //       {'Sign In'} - {envObj.BRAND_NAME}
  //     </title>
  //   </Helmet>
  //   <div>
  //     <p>This is a auth page</p>
  //     <br />
  //     <p>{envObj.PUBLIC_ORIGIN}</p>
  //     <br />

  //     <br />
  //     <button type='button' onClick={onSignUpClick} disabled={isLoading}>
  //       Sign Up with Credential
  //     </button>
  //     <br />

  //     <button type='button' onClick={onSignInClick} disabled={isLoading}>
  //       Login with Credential
  //     </button>
  //     <br />

  //     <button type='button' onClick={onGoogleAuthenticateClick} disabled={isLoading}>
  //       Login with Google
  //     </button>
  //   </div>
  // </>

  const [type, toggle] = useToggle(['login', 'register']);
  const form = useForm({
    initialValues: {
      email: '',
      name: '',
      password: '',
      terms: true,
    },

    validate: {
      email: (val) => (/^\S+@\S+$/.test(val) ? null : 'Invalid email'),
      password: (val) => (val.length <= 6 ? 'Password should include at least 6 characters' : null),
    },
  });

  return (
    <Paper radius='md' p='lg' withBorder>
      <Text size='lg' fw={500}>
        Welcome to Mantine, {type} with
      </Text>

      <Group grow mb='md' mt='md'>
        <GoogleButton radius='xl'>Google</GoogleButton>
      </Group>

      <Divider label='Or continue with email' labelPosition='center' my='lg' />

      <form onSubmit={form.onSubmit((data) => console.log(data))}>
        <Stack>
          {type === 'register' && (
            <TextInput
              label='Name'
              placeholder='Your name'
              value={form.values.name}
              onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
              radius='md'
            />
          )}

          <TextInput
            required
            label='Email'
            placeholder='hello@mantine.dev'
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email && 'Invalid email'}
            radius='md'
          />

          <PasswordInput
            required
            label='Password'
            placeholder='Your password'
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password && 'Password should include at least 6 characters'}
            radius='md'
          />

          {type === 'register' && (
            <Checkbox
              label='I accept terms and conditions'
              checked={form.values.terms}
              onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            />
          )}
        </Stack>

        <Group justify='space-between' mt='xl'>
          <Anchor component='button' type='button' c='dimmed' onClick={() => toggle()} size='xs'>
            {type === 'register'
              ? 'Already have an account? Login'
              : "Don't have an account? Register"}
          </Anchor>
          <Button type='submit' radius='xl'>
            {upperFirst(type)}
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
