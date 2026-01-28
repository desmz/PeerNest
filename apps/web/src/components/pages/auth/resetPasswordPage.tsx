import { Box, Button, Card, Group, Image, PasswordInput, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { RESET_PASSWORD_URL, resetPasswordRoSchema, TResetPasswordRo } from '@peernest/contract';
import { useMutation } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useNavigate, useSearchParams } from 'react-router';

import LogoImage from '@/assets/logo.svg';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';

async function resetPassword(data: TResetPasswordRo) {
  await api.post<void>(RESET_PASSWORD_URL, data);
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code') ?? '';

  const resetPasswordForm = useForm<TResetPasswordRo>({
    initialValues: {
      newPassword: '',
      confirmPassword: '',
      code: code,
    },

    validate: zod4Resolver(resetPasswordRoSchema),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: TResetPasswordRo) => {
      await resetPassword(data);
    },
    onSuccess: () => {
      resetPasswordForm.reset();
      navigate(APP_ROUTE.SIGN_IN);
    },
    onError: () => {
      notifications.show({
        message: 'Something went wrong, please try again later',
        color: 'red',
      });
    },
  });

  async function onResetPasswordClick(data: TResetPasswordRo) {
    resetPasswordMutation.mutate(data);
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
          Reset your password
        </Text>

        <form onSubmit={resetPasswordForm.onSubmit(onResetPasswordClick)}>
          <Stack gap={'md'}>
            <PasswordInput
              required
              label='Password'
              placeholder='Password'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={resetPasswordForm.key('newPassword')}
              {...resetPasswordForm.getInputProps('newPassword')}
            />
            <PasswordInput
              required
              label='Confirm Password'
              placeholder='Confirm password'
              radius='md'
              labelProps={{ fw: 600, mb: 'xs' }}
              key={resetPasswordForm.key('confirmPassword')}
              {...resetPasswordForm.getInputProps('confirmPassword')}
            />
          </Stack>

          <Group justify='space-between' mt='xl'>
            <div></div>
            <Group justify='flex-end'>
              <Button
                type='submit'
                radius='xl'
                disabled={resetPasswordMutation.status === 'pending'}>
                Reset
              </Button>
            </Group>
          </Group>
        </form>
      </Card>
    </Box>
  );
}
