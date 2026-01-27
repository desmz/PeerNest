import {
  Anchor,
  AppShell,
  Avatar,
  Burger,
  Button,
  FileInput,
  Flex,
  Group,
  Image,
  Menu,
  Modal,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  APPLY_ROLE_URL,
  applyRoleRoSchema,
  GET_ROLES_URL,
  TApplyRoleRo,
  TGetRolesVo,
} from '@peernest/contract';
import { UploadType, UserRole } from '@peernest/core';
import { IconArrowRight, IconDoorExit } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';

import logoImage from '@/assets/logo.svg';
import useUploadAttachment from '@/features/attachment/hooks/use-upload-attachment';
import useAuth from '@/features/auth/hooks/use-auth';
import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';

import AppShellHeaderDiscussions from './components/appShellHeaderDiscussions';
import AppShellHeaderPeerMatching from './components/appShellHeaderPeerMatching';
import AppShellHeaderWellness from './components/appShellHeaderWellness';
import classes from './globalAppShell.module.css';

type TGlobalAppShellProps = {
  children: React.ReactNode;
};

const headerMap = {
  [APP_ROUTE.USER]: <AppShellHeaderPeerMatching />,
  [APP_ROUTE.WELLNESS]: <AppShellHeaderWellness />,
  [APP_ROUTE.DISCUSSION]: <AppShellHeaderDiscussions />,
};

export default function GlobalAppShell({ children }: TGlobalAppShellProps) {
  const [opened, { toggle }] = useDisclosure();
  const [currentUser] = useAtom(currentUserAtom);
  const location = useLocation();
  const [headerComponent, setHeaderComponent] = useState<React.ReactNode>(null);
  const { signOut } = useAuth();

  useEffect(() => {
    const matchedHeader = Object.entries(headerMap).find(([route]) =>
      location.pathname.startsWith(route)
    )?.[1];

    setHeaderComponent(matchedHeader);
  }, [location]);
  // 1. call api
  async function getRole() {
    return api.get<TGetRolesVo>(GET_ROLES_URL);
  }

  async function applyRole(data: TApplyRoleRo) {
    const res = await api.post<void>(APPLY_ROLE_URL, data);
    return res.data;
  }

  const [modalOpened, modalHandlers] = useDisclosure(false);
  const { uploadFile, isUploading } = useUploadAttachment();

  // 2. data fetching library
  const { data: roleData } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const res = await getRole();
      return res.data;
    },
  });

  async function onFileUploadChange(file: File | null) {
    if (!file) return;

    try {
      const result = await uploadFile({
        file,
        type: UploadType.RoleApplication,
      });

      applyRoleForm.setFieldValue('attachmentId', result.attachmentId);
    } catch (err) {
      console.error(err);
      notifications.show({
        message: 'Failed to upload the file. Please try again later',
        color: 'red',
      });
    }
  }

  // 3. form handling
  // set values for all fields
  // validate all fields
  const applyRoleForm = useForm<TApplyRoleRo>({
    initialValues: {
      roleId: '',
      description: '',
      attachmentId: null,
    },
    validate: zod4Resolver(applyRoleRoSchema),
  });

  const applyRoleMutation = useMutation<void, Error, TApplyRoleRo>({
    mutationFn: (data) => applyRole(data),
    onSuccess: (_, variables) => {
      const roleName = roleData?.find((role) => role.roleId === variables.roleId)?.roleName;

      notifications.show({
        message: `Your application for ${roleName ?? 'Unknown'} role is submitted!`,
        color: 'green',
      });

      modalHandlers.close();
      applyRoleForm.reset();
    },
    onError: () => {
      notifications.show({
        message: `Error: Your application is failed to submit. Please try again.`,
        color: 'red',
      });

      modalHandlers.close();
      applyRoleForm.reset();
    },
  });

  async function onApplyRoleSubmit(data: TApplyRoleRo) {
    applyRoleMutation.mutate(data);
  }

  const roleNames = roleData
    ?.filter((role) => role.roleName !== UserRole.User)
    .map((role) => ({
      label: role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1),
      value: role.roleId,
    }));

  async function onSignOutClick() {
    await signOut();
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding='0'>
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
              <Menu shadow='md' width={200} position='bottom-end' offset={8}>
                <Menu.Target>
                  <Avatar src={currentUser?.avatarUrl} radius={100} size={36} />
                </Menu.Target>
                <Menu.Dropdown py={8}>
                  <Menu.Item>
                    <Button
                      leftSection={<IconDoorExit />}
                      onClick={onSignOutClick}
                      variant='transparent'
                      c={'black'}
                      size='compact-sm'>
                      Sign Out
                    </Button>
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
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
        <AppShell.Section p='md'>
          <Modal
            opened={modalOpened}
            onClose={modalHandlers.close}
            title='Apply a Role'
            centered
            padding={'md'}
            size={720}
            classNames={{
              title: classes.modalTitle,
            }}>
            <form onSubmit={applyRoleForm.onSubmit(onApplyRoleSubmit)}>
              <Stack gap='xl'>
                <Select
                  label='Role'
                  withAsterisk
                  placeholder='Choose the role you would like to apply'
                  data={roleNames}
                  classNames={{
                    label: classes.modalFormLabel,
                  }}
                  {...applyRoleForm.getInputProps('roleId')}
                />
                <Textarea
                  label='Description'
                  withAsterisk
                  description='Introduce yourself and explain why you are qualified for the chosen role.'
                  placeholder='What make you as a good candidate for the role...'
                  minRows={4}
                  maxRows={12}
                  autosize={true}
                  classNames={{
                    label: classes.modalFormLabel,
                  }}
                  {...applyRoleForm.getInputProps('description')}
                />
                <FileInput
                  label='File'
                  description='Only 1 pdf file (< 10MB) is allowed.'
                  placeholder='Pick File'
                  accept='application/pdf,image/*'
                  w={'fit-content'}
                  onChange={onFileUploadChange}
                  disabled={isUploading}
                  clearable={!isUploading}
                  // value={attachment}
                  classNames={{
                    label: classes.modalFormLabel,
                  }}
                />
                <Flex direction={'row-reverse'}>
                  <Button w={'fit-content'} variant='filled' type='submit' disabled={isUploading}>
                    Submit
                  </Button>
                </Flex>
              </Stack>
            </form>
          </Modal>
          <Button
            variant='filled'
            size='md'
            radius='md'
            fw='400'
            w={'100%'}
            rightSection={<IconArrowRight size={16} />}
            onClick={modalHandlers.open}>
            Apply Role
          </Button>
        </AppShell.Section>
      </AppShell.Navbar>
      <AppShell.Main h={'fit-content'} bg='gray.1'>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
