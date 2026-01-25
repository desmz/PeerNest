import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  GET_DOMAINS_URL,
  GET_INTERESTS_URL,
  GET_ME_PROFILE_URL,
  GET_PERSONAL_GOALS_URL,
  GET_PRONOUNS_URL,
  GET_UNIVERSITIES_URL,
  TGetDomainsVo,
  TGetInterestsVo,
  TGetPersonalGoalsVo,
  TGetPronounsVo,
  TGetUniversityVo,
  TUpdateMeProfileRo,
  TUpdateMeProfileVo,
  UPDATE_ME_PROFILE_URL,
  updateMeProfileRoSchema,
  type TGetMeProfileVo,
} from '@peernest/contract';
import { MAX_BIO_LEN, MAX_LOOKING_FOR_LEN, UserRole } from '@peernest/core';
import { IconChevronDown, IconEdit, IconLock, IconMail } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAtom } from 'jotai';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { APP_ROUTE } from '@/lib/app-route';
import { capitalizeFirstLetter } from '@/lib/util';

async function getMeProfile() {
  return await api.get<TGetMeProfileVo>(GET_ME_PROFILE_URL);
}

async function getPronouns() {
  return await api.get<TGetPronounsVo>(GET_PRONOUNS_URL);
}

async function getUniversities() {
  return await api.get<TGetUniversityVo>(GET_UNIVERSITIES_URL);
}

async function getDomains() {
  return await api.get<TGetDomainsVo>(GET_DOMAINS_URL);
}

async function getPersonalGoals() {
  return await api.get<TGetPersonalGoalsVo>(GET_PERSONAL_GOALS_URL);
}

async function getInterests() {
  return await api.get<TGetInterestsVo>(GET_INTERESTS_URL);
}

async function updateMeProfile(data: TUpdateMeProfileRo) {
  return await api.put<TUpdateMeProfileVo>(UPDATE_ME_PROFILE_URL, data);
}

export default function MyProfilePage() {
  const [currentUser] = useAtom(currentUserAtom);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['users', 'me', 'profile'],
    queryFn: async () => (await getMeProfile()).data,
  });
  const { data: pronounsData } = useQuery({
    queryKey: ['pronouns'],
    queryFn: async () => {
      return (await getPronouns()).data;
    },
  });
  const { data: universitiesData } = useQuery({
    queryKey: ['universities'],
    queryFn: async () => {
      return (await getUniversities()).data;
    },
  });
  const { data: domainsData } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      return (await getDomains()).data;
    },
  });
  const { data: personalGoalsData } = useQuery({
    queryKey: ['personalGoals'],
    queryFn: async () => {
      return (await getPersonalGoals()).data;
    },
  });
  const { data: interestsData } = useQuery({
    queryKey: ['interests'],
    queryFn: async () => {
      return (await getInterests()).data;
    },
  });

  const me = query.data;

  const updateMeProfileForm = useForm<TUpdateMeProfileRo>({
    initialValues: {
      userDisplayName: null,
      userInfoPronounId: null,
      userInfoUniversityId: null,
      userInfoDomainId: null,
      userInfoBio: null,
      userInfoLookingFor: null,
      interestIds: [],
      personalGoalIds: [],
    },
    validate: zod4Resolver(updateMeProfileRoSchema),
  });

  useEffect(() => {
    if (!me || !currentUser) return;

    updateMeProfileForm.setValues({
      userDisplayName: currentUser.displayName ?? null,
      userInfoPronounId: me.pronoun?.pronounId ?? null,
      userInfoUniversityId: me.university?.universityId ?? null,
      userInfoDomainId: me.domain?.domainId ?? null,
      userInfoBio: me.userInfoBio ?? null,
      userInfoLookingFor: me.userInfoLookingFor ?? null,
      interestIds: me.interests?.map((i) => i.interestId) ?? [],
      personalGoalIds: me.personalGoals?.map((g) => g.personalGoalId) ?? [],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me, currentUser]);

  const updateMeProfileMutation = useMutation<void, Error, TUpdateMeProfileRo>({
    mutationFn: async (data) => {
      await updateMeProfile(data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['users', 'me', 'profile'],
      });
      navigate(APP_ROUTE.USER_ME);
    },
  });

  const pronounOptions = pronounsData?.map((pronoun) => ({
    label: capitalizeFirstLetter(pronoun.pronounName),
    value: pronoun.pronounId,
  }));
  const universityOptions = universitiesData?.map((university) => ({
    label: university.universityName,
    value: university.universityId,
  }));
  const domainOptions = domainsData?.map((domain) => ({
    label: capitalizeFirstLetter(domain.domainName),
    value: domain.domainId,
  }));
  const personalGoalOptions = personalGoalsData?.map((goal) => ({
    label: goal.personalGoalTitle,
    value: goal.personalGoalId,
  }));

  const interestOptions = interestsData?.map((interest) => ({
    label: interest.interestName,
    value: interest.interestId,
  }));

  const onUpdateMeProfileSubmit = (data: TUpdateMeProfileRo) => {
    updateMeProfileMutation.mutate(data);
  };

  if (query.isPending) return <Text>Loading…</Text>;
  if (query.isError) return <Text c='red'>Failed to load profile.</Text>;

  const subtitle = [
    me?.pronoun?.pronounName,
    me?.university?.universityName,
    me?.domain?.domainName,
  ]
    .filter(Boolean)
    .map((s) => capitalizeFirstLetter(String(s)))
    .join(' · ');

  return (
    <Box>
      <form onSubmit={updateMeProfileForm.onSubmit(onUpdateMeProfileSubmit)}>
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
                  <Button type='submit' leftSection={<IconEdit size={16} />} radius='md' size='sm'>
                    Save
                  </Button>

                  <Button leftSection={<IconLock size={16} />} radius='md' size='sm' disabled>
                    Change Password
                  </Button>
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
                <Flex align='flex-end' h={56}>
                  <Button leftSection={<IconMail size={16} />} radius='md' size='sm' disabled>
                    Change Email
                  </Button>
                </Flex>
              </Grid.Col>

              {/* Display Name */}
              <Grid.Col span={6}>
                <TextInput
                  label={<Text fw={600}>Display Name</Text>}
                  key={updateMeProfileForm.key('userDisplayName')}
                  {...updateMeProfileForm.getInputProps('userDisplayName')}
                  radius={'md'}
                  styles={{ label: { marginBottom: 6 } }}
                />
              </Grid.Col>

              {/* Pronoun */}
              <Grid.Col span={6}>
                <Select
                  searchable
                  label={<Text fw={600}>Pronoun</Text>}
                  placeholder='Select'
                  data={pronounOptions}
                  styles={{ label: { marginBottom: 6 } }}
                  radius={'md'}
                  key={updateMeProfileForm.key('userInfoPronounId')}
                  {...updateMeProfileForm.getInputProps('userInfoPronounId')}
                />
              </Grid.Col>

              {/* University */}
              <Grid.Col span={6}>
                <Select
                  searchable
                  label={<Text fw={600}>University/College</Text>}
                  placeholder='Select'
                  data={universityOptions}
                  styles={{ label: { marginBottom: 6 } }}
                  radius={'md'}
                  key={updateMeProfileForm.key('userInfoUniversityId')}
                  {...updateMeProfileForm.getInputProps('userInfoUniversityId')}
                />
              </Grid.Col>

              {/* Major */}
              <Grid.Col span={6}>
                <Select
                  searchable
                  label={<Text fw={600}>Major/Domain</Text>}
                  placeholder='Select'
                  data={domainOptions}
                  styles={{ label: { marginBottom: 6 } }}
                  radius={'md'}
                  key={updateMeProfileForm.key('userInfoDomainId')}
                  {...updateMeProfileForm.getInputProps('userInfoDomainId')}
                />
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Existing Details card */}
          <Paper radius='md' p={16}>
            <Stack gap={16}>
              <Box>
                <Title order={5}>About</Title>
                <Textarea
                  mt={8}
                  minRows={5}
                  maxRows={10}
                  autosize
                  radius={'md'}
                  key={updateMeProfileForm.key('userInfoBio')}
                  {...updateMeProfileForm.getInputProps('userInfoBio')}
                />
                <Text size='xs' c='dimmed' ta='right' mt={6}>
                  {updateMeProfileForm.values.userInfoBio?.length ?? 0}/{MAX_BIO_LEN}
                </Text>
              </Box>

              <Box>
                <Title order={5}>Looking For</Title>
                <Textarea
                  mt={8}
                  minRows={5}
                  maxRows={10}
                  autosize
                  radius={'md'}
                  key={updateMeProfileForm.key('userInfoLookingFor')}
                  {...updateMeProfileForm.getInputProps('userInfoLookingFor')}
                />
                <Text size='xs' c='dimmed' ta='right' mt={6}>
                  {updateMeProfileForm.values.userInfoLookingFor?.length ?? 0}/{MAX_LOOKING_FOR_LEN}
                </Text>
              </Box>

              <Box>
                <Title order={5}>Interests</Title>
                <MultiSelect
                  placeholder='Select'
                  data={interestOptions ?? []}
                  rightSection={<IconChevronDown size={16} />}
                  rightSectionPointerEvents='none'
                  multiple
                  searchable
                  radius={'md'}
                  pt={6}
                  key={updateMeProfileForm.key('interestIds')}
                  {...updateMeProfileForm.getInputProps('interestIds')}
                />
              </Box>

              <Box>
                <Title order={5}>Personal Goals</Title>
                <MultiSelect
                  placeholder='Select'
                  data={personalGoalOptions ?? []}
                  rightSection={<IconChevronDown size={16} />}
                  rightSectionPointerEvents='none'
                  multiple
                  searchable
                  radius={'md'}
                  pt={6}
                  key={updateMeProfileForm.key('personalGoalIds')}
                  {...updateMeProfileForm.getInputProps('personalGoalIds')}
                />
              </Box>
            </Stack>
          </Paper>
        </Flex>
      </form>
    </Box>
  );
}
