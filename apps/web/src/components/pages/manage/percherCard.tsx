import {
  Avatar,
  Badge,
  Button,
  Divider,
  Flex,
  Group,
  Modal,
  Paper,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  RELEASE_PERCHER_URL,
  TCounselorUser,
  TReleasePercherParams,
  TUpdatePercherNoteRo,
  UPDATE_PERCHER_NOTE_URL,
  updatePercherNoteRoSchema,
  urlBuilder,
} from '@peernest/contract';
import {
  IconCheck,
  IconCircleCheck,
  IconEdit,
  IconMessageCircle,
  IconX,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import { Link } from 'react-router';

import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

import classes from './managePage.module.css';

type TPercherCharProps = {
  percher: TCounselorUser;
};

type TUpdatePercherNoteForm = TUpdatePercherNoteRo & { percherId: string };

// update note API
async function updatePercher(percherId: string, updatePercherNoteRo: TUpdatePercherNoteRo) {
  const url = urlBuilder(UPDATE_PERCHER_NOTE_URL, { percherId });
  await api.patch<void>(url, updatePercherNoteRo);
}

async function releasePercher(params: TReleasePercherParams) {
  const url = urlBuilder(RELEASE_PERCHER_URL, params);
  await api.post<void>(url);
}

export default function PercherCard({ percher }: TPercherCharProps) {
  const [modalOpened, modalHandlers] = useDisclosure(false);
  const [opened, handlers] = useDisclosure(false);
  const [percherState, setPercherState] = useState(percher);

  const openEditModal = () => {
    modalHandlers.open();
  };

  // Form handling
  const updatePercherNote = useForm<TUpdatePercherNoteForm>({
    initialValues: {
      percherId: percherState.user.userId,
      note: percherState.counselorUserNote,
    },
    validate: zod4Resolver(updatePercherNoteRoSchema),
  });

  const updatePercherNoteMutation = useMutation<void, Error, TUpdatePercherNoteForm>({
    mutationFn: async (data) => {
      const { percherId, ...formdata } = data;
      return updatePercher(percherId, formdata);
    },
    onSuccess: (_, variables) => {
      notifications.show({
        message: `Note for percher has been updated succesfully!`,
        color: 'green',
      });

      modalHandlers.close();
      updatePercherNote.reset();
      setPercherState((percher) => {
        return {
          ...percher,
          counselorUserNote: variables.note,
        };
      });
    },
    onError: () => {
      notifications.show({
        message: `Error: Note for percher has failed to update. Please try again.`,
        color: 'red',
      });

      modalHandlers.close();
      updatePercherNote.reset();
    },
  });

  async function onReleaseClick() {
    await releasePercher({
      percherId: percher.user.userId,
    });
    window.location.reload();
  }

  const onUpdatePercherNoteSubmit = (data: TUpdatePercherNoteForm) => {
    updatePercherNoteMutation.mutate(data);
  };

  const subtitlesArr: string[] = [];

  if (percher.user.pronoun?.pronounName) {
    subtitlesArr.push(capitalizeFirstLetter(percher.user.pronoun?.pronounName));
  }

  if (percher.user.university?.universityName) {
    subtitlesArr.push(capitalizeFirstLetter(percher.user.university?.universityName));
  }

  if (percher.user.domain?.domainName) {
    subtitlesArr.push(capitalizeFirstLetter(percher.user.domain.domainName));
  }

  const subtitle = [
    percher.user.pronoun?.pronounName,
    percher.user.university?.universityName,
    percher.user.domain?.domainName,
  ]
    .filter(Boolean)
    .map((s) => capitalizeFirstLetter(String(s)))
    .join(' · ');

  return (
    <Flex maw={'70%'} mx='auto' direction={'column'} key={percher.user.userId} w={'100%'}>
      <Paper radius='md' p={16} mb={16}>
        <Group align='top' gap={16} wrap='nowrap'>
          <Avatar src={percher.user.userAvatarUrl} size={'xl'} radius={100} />

          <Flex w={'100%'} direction={'column'} gap={12}>
            <div>
              <Title order={4}>{percher.user.userDisplayName}</Title>
              <Text size='xs' c='dimmed' mt={4}>
                {subtitle}
              </Text>
              <Group gap={8} mt={8} wrap='nowrap' className={classes.badgesOneLine}>
                {(percher.user.personalGoals ?? []).map((g) => (
                  <Badge
                    key={g.personalGoalId}
                    color='blue'
                    size='sm'
                    fw={600}
                    style={{ textTransform: 'capitalize' }}>
                    {g.personalGoalName}
                  </Badge>
                ))}
                {(percher.user.interests ?? []).map((i) => (
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
              <Flex justify={'space-between'} pt={'sm'}>
                <Flex justify={'flex-start'} align={'flex-end'}>
                  <Text>{percher.user.userInfoLookingFor ?? '—'}</Text>
                </Flex>
                <Flex
                  w={'fit-content'}
                  direction={{ base: 'column', sm: 'row' }}
                  gap={'xs'}
                  justify={'flex-end'}>
                  <Button
                    component={Link}
                    to={`${APP_ROUTE.USER}/${percher.user.userId}`}
                    variant='light'
                    color='yellow'
                    radius='md'
                    leftSection={<IconMessageCircle size={16} />}
                    styles={(theme) => ({
                      root: {
                        border: `1px solid ${theme.colors.yellow[5]}`,
                        color: theme.colors.yellow[7],
                        backgroundColor: theme.colors.yellow[0],
                      },
                    })}>
                    View Profile
                  </Button>
                  <Button
                    variant='light'
                    color='blue'
                    radius='xl'
                    leftSection={<IconEdit size={16} />}
                    onClick={() => openEditModal()}>
                    Edit Note
                  </Button>
                  <Button
                    variant='light'
                    color='red'
                    radius='xl'
                    leftSection={<IconCircleCheck size={16} />}
                    onClick={handlers.open}>
                    Release
                  </Button>

                  {/* Edit Note Modal */}
                  <Modal
                    opened={modalOpened}
                    onClose={modalHandlers.close}
                    title='Edit Note'
                    centered
                    padding={'md'}
                    size={520}>
                    <form onSubmit={updatePercherNote.onSubmit(onUpdatePercherNoteSubmit)}>
                      <Textarea
                        variant='filled'
                        withAsterisk
                        description='Type in the note you would like to post or edit to your percher.'
                        placeholder='Insert text here. Text should be anywhere between 2 & 2000 text.'
                        minRows={4}
                        autosize={true}
                        {...updatePercherNote.getInputProps('note')}
                      />
                      <Flex direction={'row-reverse'} pt='md'>
                        <Button w={'fit-content'} variant='filled' type='submit'>
                          Update
                        </Button>
                      </Flex>
                    </form>
                  </Modal>

                  {/* Remove Percher Modal */}
                  <Modal
                    opened={opened}
                    onClose={handlers.close}
                    title='ARE YOU SURE YOU WANT TO DROP THIS PERCHER?'
                    centered
                    padding={'md'}
                    size={520}>
                    <Flex
                      w={'fit-content'}
                      direction={{ base: 'column', sm: 'row' }}
                      gap={'xs'}
                      justify={'flex-end'}
                      ml='auto'>
                      <Button
                        variant='light'
                        color='green'
                        radius='xl'
                        leftSection={<IconCheck size={16} />}
                        onClick={onReleaseClick}>
                        YES
                      </Button>
                      <Button
                        variant='light'
                        color='red'
                        radius='xl'
                        leftSection={<IconX size={16} />}
                        onClick={handlers.close}>
                        NO
                      </Button>
                    </Flex>
                  </Modal>
                </Flex>
              </Flex>
            </div>
          </Flex>
        </Group>

        <Divider my='sm' />

        <Flex direction='column'>
          <Flex>
            <Text fw={'600'}>Note</Text>
            <Flex align={'center'}>
              <Text c={'dimmed'} pl={'8'} size='xs'>
                (Last edited at 14:31, 12/03/25)
              </Text>
            </Flex>
          </Flex>

          <Flex>{percherState.counselorUserNote} </Flex>
        </Flex>
      </Paper>
    </Flex>
  );
}
