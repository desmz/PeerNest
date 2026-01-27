import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  CHANGE_PASSWORD_URL,
  changePasswordRoSchema,
  GET_ME_PROFILE_URL,
  TChangePasswordRo,
  TVerifyChangeEmailRo,
  VERIFY_CHANGE_EMAIL_URL,
  verifyChangeEmailRoSchema,
  type TGetMeProfileVo,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';
import { IconEdit, IconLock, IconMail } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { Link } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

async function getMeProfile() {
  return await api.get<TGetMeProfileVo>(GET_ME_PROFILE_URL);
}

async function changePassword(data: TChangePasswordRo) {
  await api.patch<void>(CHANGE_PASSWORD_URL, data);
}

async function verifyChangeEmail(data: TVerifyChangeEmailRo) {
  await api.patch<void>(VERIFY_CHANGE_EMAIL_URL, data);
}

export default function MyProfilePage() {
  const [currentUser] = useAtom(currentUserAtom);
  const [changePasswordModalOpened, changePasswordModalHandler] = useDisclosure(false);
  const [verifyChangeEmailModalOpened, verifyChangeEmailModalHandler] = useDisclosure(false);

  const query = useQuery({
    queryKey: ['users', 'me', 'profile'],
    queryFn: async () => (await getMeProfile()).data,
  });

  const changePasswordForm = useForm<TChangePasswordRo>({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: zod4Resolver(changePasswordRoSchema),
  });

  const changePasswordMutation = useMutation<
    void,
    { error: { message: string } },
    TChangePasswordRo
  >({
    mutationFn: async (data) => {
      await changePassword(data);
    },
    onSuccess: () => {
      notifications.show({
        message: 'You password have been updated successfully!',
        color: 'green',
      });

      changePasswordModalHandler.close();
      changePasswordForm.reset();
    },
    onError: (err) => {
      notifications.show({
        message: err.error.message,
        color: 'red',
      });
    },
  });

  const onChangePasswordSubmit = (data: TChangePasswordRo) => {
    changePasswordMutation.mutate(data);
  };

  const verifyChangeEmailForm = useForm<TVerifyChangeEmailRo>({
    initialValues: {
      newEmail: '',
    },
    validate: zod4Resolver(verifyChangeEmailRoSchema),
  });

  const verifyChangeEmailMutation = useMutation<
    void,
    { error: { message: string } },
    TVerifyChangeEmailRo
  >({
    mutationFn: async (data) => {
      await verifyChangeEmail(data);
    },
    onSuccess: () => {
      notifications.show({
        message: 'Please check your mailbox to verify new email.',
        color: 'green',
      });

      verifyChangeEmailModalHandler.close();
      verifyChangeEmailForm.reset();
    },
    onError: (err) => {
      console.error(err);
      notifications.show({
        message: err.error.message,
        color: 'red',
      });
    },
  });

  const onVerifyChangeEmailSubmit = (data: TVerifyChangeEmailRo) => {
    verifyChangeEmailMutation.mutate(data);
  };

  if (query.isPending) return <Text>Loading…</Text>;
  if (query.isError) return <Text c='red'>Failed to load profile.</Text>;

  const me = query.data;

  const subtitle = [me.pronoun?.pronounName, me.university?.universityName, me.domain?.domainName]
    .filter(Boolean)
    .map((s) => capitalizeFirstLetter(String(s)))
    .join(' · ');

  return (
    <Box>
      <Flex maw='70%' mx='auto' py={24} direction='column'>
        {/* Header card (avatar + name + buttons) */}
        <Paper radius='md' p={16} mb={16}>
          <Group align='center' gap={16} wrap='nowrap'>
            <Avatar src={currentUser?.avatarUrl} size='xl' radius={100} />

            <Flex direction='column' gap={12} style={{ flex: 1 }}>
              <div>
                <Flex gap={8} align={'center'}>
                  <Title order={4}>{currentUser?.displayName}</Title>
                  {currentUser?.role && currentUser.role !== UserRole.User && (
                    <Badge color='yellow' size='xs' style={{ textTransform: 'capitalize' }}>
                      {capitalizeFirstLetter(currentUser.role)}
                    </Badge>
                  )}
                </Flex>
                <Text size='xs' c='dimmed' mt={4}>
                  {subtitle}
                </Text>
              </div>

              <Group gap={12}>
                <Button
                  leftSection={<IconEdit size={16} />}
                  radius='md'
                  size='sm'
                  component={Link}
                  to={`${APP_ROUTE.USER_ME}/edit`}>
                  Edit Profile
                </Button>

                <Button
                  leftSection={<IconLock size={16} />}
                  radius='md'
                  size='sm'
                  onClick={changePasswordModalHandler.open}>
                  Change Password
                </Button>
                <Modal
                  opened={changePasswordModalOpened}
                  onClose={changePasswordModalHandler.close}
                  title={
                    <Text fw={600} fz={'lg'}>
                      Change Your Password
                    </Text>
                  }
                  centered
                  padding={'lg'}
                  size={520}>
                  <form onSubmit={changePasswordForm.onSubmit(onChangePasswordSubmit)}>
                    <Stack gap={48}>
                      <Stack>
                        <TextInput
                          label='Old Password'
                          key={changePasswordForm.key('oldPassword')}
                          type='password'
                          {...changePasswordForm.getInputProps('oldPassword')}
                          radius={'md'}
                          styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
                          withAsterisk
                        />
                        <TextInput
                          label='New Password'
                          key={changePasswordForm.key('newPassword')}
                          {...changePasswordForm.getInputProps('newPassword')}
                          type='password'
                          radius={'md'}
                          styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
                          withAsterisk
                        />
                        <TextInput
                          label='Confirm Password'
                          key={changePasswordForm.key('confirmPassword')}
                          {...changePasswordForm.getInputProps('confirmPassword')}
                          type='password'
                          withAsterisk
                          radius={'md'}
                          styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
                        />
                      </Stack>
                      <Flex
                        w={'fit-content'}
                        direction={{ base: 'column', sm: 'row' }}
                        gap={'xs'}
                        justify={'flex-end'}
                        ml='auto'>
                        <Button
                          variant='subtle'
                          color='gray'
                          radius='lg'
                          onClick={changePasswordModalHandler.close}>
                          Cancel
                        </Button>
                        <Button type='submit' variant='filled' radius='lg'>
                          Submit
                        </Button>
                      </Flex>
                    </Stack>
                  </form>
                </Modal>
              </Group>
            </Flex>
          </Group>
        </Paper>

        {/* Info card */}
        <Paper radius={10} p={16} mb={24}>
          <Grid gutter={16}>
            {/* Email row */}
            <Grid.Col span={6}>
              <Text fw={600}>Email</Text>
              <Text mt={6}>{currentUser?.email ?? '—'}</Text>
            </Grid.Col>

            <Grid.Col span={6}>
              <Button
                leftSection={<IconMail size={16} />}
                radius='md'
                size='sm'
                onClick={verifyChangeEmailModalHandler.open}>
                Change Email
              </Button>
              <Modal
                opened={verifyChangeEmailModalOpened}
                onClose={verifyChangeEmailModalHandler.close}
                title={
                  <Text fw={600} fz={'lg'}>
                    Change Your Email
                  </Text>
                }
                centered
                padding={'lg'}
                size={520}>
                <form onSubmit={verifyChangeEmailForm.onSubmit(onVerifyChangeEmailSubmit)}>
                  <Stack gap={48}>
                    <Stack>
                      <TextInput
                        label='New Email'
                        type='email'
                        key={verifyChangeEmailForm.key('newEmail')}
                        {...verifyChangeEmailForm.getInputProps('newEmail')}
                        radius={'md'}
                        styles={{ label: { marginBottom: 6, fontWeight: 600 } }}
                        withAsterisk
                      />
                    </Stack>
                    <Flex
                      w={'fit-content'}
                      direction={{ base: 'column', sm: 'row' }}
                      gap={'xs'}
                      justify={'flex-end'}
                      ml='auto'>
                      <Button
                        variant='subtle'
                        color='gray'
                        radius='lg'
                        onClick={verifyChangeEmailModalHandler.close}>
                        Cancel
                      </Button>
                      <Button type='submit' variant='filled' radius='lg'>
                        Submit
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              </Modal>
            </Grid.Col>

            {/* Display Name */}
            <Grid.Col span={6}>
              <Text fw={600}>Display Name</Text>
              <Text mt={6}>{me.userDisplayName ?? '—'}</Text>
            </Grid.Col>

            {/* Pronoun */}
            <Grid.Col span={6}>
              <Text fw={600}>Pronoun</Text>
              <Text mt={6}>
                {me.pronoun?.pronounName ? capitalizeFirstLetter(me.pronoun.pronounName) : '—'}
              </Text>
            </Grid.Col>

            {/* University */}
            <Grid.Col span={6}>
              <Text fw={600}>University/College</Text>
              <Text mt={6}>
                {me.university?.universityName
                  ? capitalizeFirstLetter(me.university.universityName)
                  : '—'}
              </Text>
            </Grid.Col>

            {/* Major */}
            <Grid.Col span={6}>
              <Text fw={600}>Major/Domain</Text>
              <Text mt={6}>
                {me.domain?.domainName ? capitalizeFirstLetter(me.domain.domainName) : '—'}
              </Text>
            </Grid.Col>
          </Grid>
        </Paper>

        {/* Existing Details card */}
        <Paper radius='md' p={16}>
          <Stack gap={16}>
            <Box>
              <Title order={5}>About</Title>
              <Text mt={4}>{me.userInfoBio ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Looking For</Title>
              <Text mt={4}>{me.userInfoLookingFor ?? '—'}</Text>
            </Box>

            <Box>
              <Title order={5}>Interests</Title>
              <Group mt={6} gap={8} wrap='wrap'>
                {(me.interests ?? []).map((i) => (
                  <Badge
                    key={i.interestId}
                    color='green'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {i.interestName}
                  </Badge>
                ))}
              </Group>
            </Box>

            <Box>
              <Title order={5}>Personal Goals</Title>
              <Group mt={6} gap={8} wrap='wrap'>
                {(me.personalGoals ?? []).map((g) => (
                  <Badge
                    key={g.personalGoalId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {g.personalGoalName}
                  </Badge>
                ))}
              </Group>
            </Box>
          </Stack>
        </Paper>
      </Flex>
    </Box>
  );
}
