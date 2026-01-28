import { Anchor, Box, Button, Card, Group, Image, Stack, Text, TextInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { FORGET_PASSWORD_URL, forgetPasswordRoSchema, TForgetPasswordRo } from '@peernest/contract';
import { useMutation } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useNavigate } from 'react-router';

import LogoImage from '@/assets/logo.svg';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';

async function forgetPassword(data: TForgetPasswordRo) {
  await api.post<void>(FORGET_PASSWORD_URL, data);
}

export default function ForgetPasswordPage() {
  const navigate = useNavigate();

  const forgetPasswordForm = useForm<TForgetPasswordRo>({
    initialValues: {
      email: '',
    },
    validate: zod4Resolver(forgetPasswordRoSchema),
  });

  const forgetPasswordMutation = useMutation({
    mutationFn: async (data: TForgetPasswordRo) => {
      await forgetPassword(data);
    },
    onSuccess: () => {
      forgetPasswordForm.reset();
      notifications.show({
        message: 'Please check your mailbox for confirmation.',
        color: 'green',
      });
    },
    onError: () => {
      notifications.show({
        title: 'Something went wrong, please try again later',
        message: 'Tips: Try to sign in with Google',
        color: 'red',
      });
    },
  });

  async function onForgetPasswordClick(data: TForgetPasswordRo) {
    forgetPasswordMutation.mutate(data);
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
          Forgot your password?
        </Text>

        <form onSubmit={forgetPasswordForm.onSubmit(onForgetPasswordClick)}>
          <Stack gap={'md'}>
            <TextInput
              required
              label='Email'
              placeholder='Your email'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={forgetPasswordForm.key('email')}
              {...forgetPasswordForm.getInputProps('email')}
            />
          </Stack>

          <Group justify='space-between' mt='xl'>
            <Anchor
              component='button'
              type='button'
              c='dimmed'
              size='xs'
              onClick={() => navigate(APP_ROUTE.SIGN_IN)}>
              Back to sign in
            </Anchor>
            <Group>
              <Button
                type='submit'
                radius='xl'
                disabled={forgetPasswordMutation.status === 'pending'}>
                Send
              </Button>
            </Group>
          </Group>
        </form>
      </Card>
    </Box>
  );
}
