import {
  Button,
  FileInput,
  Flex,
  MultiSelect,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  CREATE_DISCUSSION_URL,
  // createDiscussionRoSchema,
  GET_INTERESTS_URL,
  GET_PERSONAL_GOALS_URL,
  TCreateDiscussionRo,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
} from '@peernest/contract';
import { UploadType } from '@peernest/core';
// import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useMutation, useQuery } from '@tanstack/react-query';

import useUploadAttachment from '@/features/attachment/hooks/use-upload-attachment';
import api from '@/lib/api-client';

async function getGoals() {
  return api.get<TGetPersonalGoalsVo>(GET_PERSONAL_GOALS_URL);
}

async function getInterests() {
  return api.get<TGetInterestsVo>(GET_INTERESTS_URL);
}

async function createPost(data: TCreateDiscussionRo) {
  const res = await api.post<void>(CREATE_DISCUSSION_URL, data);
  return res.data;
}

export default function CreateDiscussionPage() {
  const { uploadFile, isUploading } = useUploadAttachment();

  const { data: goalData } = useQuery({
    queryKey: ['goals'],
    queryFn: async () => {
      const res = await getGoals();
      return res.data;
    },
  });

  const { data: interestData } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      const res = await getInterests();
      return res.data;
    },
  });

  const goalNames =
    goalData?.map((goal) => ({
      label: goal.personalGoalTitle.charAt(0).toUpperCase() + goal.personalGoalTitle.slice(1),
      value: goal.personalGoalId,
    })) ?? [];

  const interestNames =
    interestData?.map((interest) => ({
      label: interest.interestName.charAt(0).toUpperCase() + interest.interestName.slice(1),
      value: interest.interestId,
    })) ?? [];

  const createPostForm = useForm<TCreateDiscussionRo>({
    initialValues: {
      discussionTitle: '',
      discussionContent: '',
      goalIds: [],
      interestIds: [],
      attachmentId: null,
    },
    // validate: zod4Resolver(createDiscussionRoSchema),
  });

  const createPostMutation = useMutation<void, Error, TCreateDiscussionRo>({
    mutationFn: (data) => createPost(data),
    onSuccess: (_, variables) => {
      notifications.show({
        message: `Your discussion post is submitted successfully!`,
        color: 'green',
      });

      createPostForm.reset();
    },
    onError: () => {
      notifications.show({
        message: `Error: Your discussion is failed to submit. Please try again.`,
        color: 'red',
      });
    },
  });

  async function onFileUploadChange(file: File | null) {
    if (!file) return;

    try {
      const result = await uploadFile({
        file,
        type: UploadType.Discussion,
      });

      createPostForm.setFieldValue('attachmentId', result.attachmentId);
    } catch (err) {
      console.error(err);
      notifications.show({
        message: 'Failed to upload the file. Please try again later',
        color: 'red',
      });
    }
  }

  async function onSubmit(data: TCreateDiscussionRo) {
    console.log('success');
    console.log(data);
    createPostMutation.mutate(data);
  }

  return (
    <Flex mx='auto' maw={'640'} direction={'column'} w={'100%'} bg={'white'} p={'sm'} bdrs={'lg'}>
      <Flex>
        <form onSubmit={createPostForm.onSubmit(onSubmit)}>
          <Stack p={'sm'} gap='md' w={608}>
            <Text size='xl' fw={700}>
              Create Post
            </Text>
            <TextInput
              label='Title'
              labelProps={{ fw: 700 }}
              placeholder='Title'
              pb={'md'}
              minLength={5}
              {...createPostForm.getInputProps('discussionTitle')}
            />
            <Textarea
              label='Description'
              labelProps={{ fw: 700 }}
              placeholder='Body Text'
              pb={'md'}
              minRows={4}
              maxRows={4}
              autosize={true}
              required
              {...createPostForm.getInputProps('discussionContent')}
            />
            <MultiSelect
              placeholder='Select up to 3 Goals'
              pb={'md'}
              data={goalNames}
              searchable
              hidePickedOptions
              maxValues={3}
              {...createPostForm.getInputProps('goalIds')}
            />
            <MultiSelect
              placeholder='Select up to 3 Interests'
              pb={'md'}
              data={interestNames}
              searchable
              hidePickedOptions
              maxValues={3}
              {...createPostForm.getInputProps('interestIds')}
            />
            <FileInput
              label='Image'
              placeholder='Pick File'
              accept='application/image/*'
              w={200}
              pb={'md'}
              onChange={onFileUploadChange}
              disabled={isUploading}
              clearable={!isUploading}
            />
            <Flex justify={'right'}>
              <Button type='submit' disabled={isUploading}>
                Post
              </Button>
            </Flex>
          </Stack>
        </form>
      </Flex>
    </Flex>
  );
}
