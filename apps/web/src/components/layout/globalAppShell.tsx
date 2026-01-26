import {
  Anchor,
  AppShell,
  Button,
  Burger,
  FileInput,
  Group,
  Image,
  Modal,
  NavLink,
  ScrollArea,
  Select,
  Stack,
  Textarea,
  Title,
  Flex,
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
import { IconArrowRight } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { Link } from 'react-router';

import logoImage from '@/assets/logo.svg';
import useUploadAttachment from '@/features/attachment/hooks/use-upload-attachment';
import api from '@/lib/api-client';

import classes from './globalAppShell.module.css';

type TGlobalAppShellProps = {
  children: React.ReactNode;
};

// 1. call api
async function getRole() {
  return api.get<TGetRolesVo>(GET_ROLES_URL);
}

async function applyRole(data: TApplyRoleRo) {
  const res = await api.post<void>(APPLY_ROLE_URL, data);
  return res.data;
}

export default function GlobalAppShell({ children }: TGlobalAppShellProps) {
  const [opened, { toggle }] = useDisclosure();
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

  async function onSubmit(data: TApplyRoleRo) {
    applyRoleMutation.mutate(data);
  }

  const roleNames = roleData
    ?.filter((role) => role.roleName !== UserRole.User)
    .map((role) => ({
      label: role.roleName.charAt(0).toUpperCase() + role.roleName.slice(1),
      value: role.roleId,
    }));

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 240, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding='0'>
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
            <form onSubmit={applyRoleForm.onSubmit(onSubmit)}>
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
      <AppShell.Main bg='gray.1'>{children}</AppShell.Main>
    </AppShell>
  );
}
