import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Portal,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  GET_ME_PROFILE_URL,
  ME_URL,
  UPDATE_ME_PROFILE_URL,
  type TGetMeProfileVo,
  type TMeVo,
  type TUpdateMeProfileRo,
  type TUpdateMeProfileVo,
} from '@peernest/contract';
import { IconEdit, IconLock, IconMail } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import React from 'react';

import api from '@/lib/api-client';

type TOption = { value: string; label: string };

const PAGE_PADDING = 24;
const CARD_PADDING = 16;

const sectionTitleStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: '24px',
};

const sectionBodyStyle: React.CSSProperties = {
  fontFamily: 'Roboto, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '20px',
};

type TMyProfile = {
  email: string;
  userDisplayName: string;
  userAvatarUrl: string | null;

  userInfoPronounId: string;
  userInfoUniversityId: string;
  userInfoDomainId: string;

  userInfoBio: string;
  userInfoLookingFor: string;

  interestIds: string[];
  personalGoalIds: string[];
};

function asRecord(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null ? (v as Record<string, unknown>) : {};
}
function pickString(v: unknown, key: string): string | undefined {
  const r = asRecord(v);
  const val = r[key];
  return typeof val === 'string' ? val : undefined;
}
function pickNullableString(v: unknown, key: string): string | null {
  const s = pickString(v, key);
  return s ?? null;
}
function pickStringArray(v: unknown, key: string): string[] {
  const r = asRecord(v);
  const val = r[key];
  return Array.isArray(val) ? val.filter((x): x is string => typeof x === 'string') : [];
}

async function getMyProfile(): Promise<TMyProfile> {
  const [meRes, profileRes] = await Promise.all([
    api.get<TMeVo>(ME_URL),
    api.get<TGetMeProfileVo>(GET_ME_PROFILE_URL),
  ]);

  const meUnknown: unknown = meRes.data;
  const profileUnknown: unknown = profileRes.data;

  const email = pickString(meUnknown, 'email') ?? '';
  const userDisplayName =
    pickString(meUnknown, 'userDisplayName') ?? pickString(profileUnknown, 'userDisplayName') ?? '';
  const userAvatarUrl =
    pickNullableString(meUnknown, 'userAvatarUrl') ??
    pickNullableString(meUnknown, 'avatarUrl') ??
    pickNullableString(profileUnknown, 'userAvatarUrl');

  const userInfoPronounId = pickString(profileUnknown, 'userInfoPronounId') ?? '';
  const userInfoUniversityId = pickString(profileUnknown, 'userInfoUniversityId') ?? '';
  const userInfoDomainId = pickString(profileUnknown, 'userInfoDomainId') ?? '';

  const userInfoBio = pickString(profileUnknown, 'userInfoBio') ?? '';
  const userInfoLookingFor = pickString(profileUnknown, 'userInfoLookingFor') ?? '';

  const profileRec = asRecord(profileUnknown);
  const interestsRaw = Array.isArray(profileRec.interests) ? profileRec.interests : [];
  const personalGoalsRaw = Array.isArray(profileRec.personalGoals) ? profileRec.personalGoals : [];

  const interestIds = interestsRaw
    .map((x) => pickString(x, 'interestId'))
    .filter((x): x is string => Boolean(x));

  const personalGoalIds = personalGoalsRaw
    .map((x) => pickString(x, 'personalGoalId'))
    .filter((x): x is string => Boolean(x));

  return {
    email,
    userDisplayName,
    userAvatarUrl,

    userInfoPronounId,
    userInfoUniversityId,
    userInfoDomainId,

    userInfoBio,
    userInfoLookingFor,

    interestIds,
    personalGoalIds,
  };
}

async function saveMyProfile(payload: TUpdateMeProfileRo): Promise<TUpdateMeProfileVo> {
  const res = await api.put<TUpdateMeProfileVo>(UPDATE_ME_PROFILE_URL, payload);
  return res.data;
}

export default function MyProfileEditingPage() {
  // TODO: replace  with backend-provided options later
  const pronounOptions: TOption[] = [
    { value: 'pronoun-he', label: 'He' },
    { value: 'pronoun-she', label: 'She' },
    { value: 'pronoun-they', label: 'They' },
  ];
  const uniOptions: TOption[] = [
    { value: 'uni-mmu', label: 'Multimedia University' },
    { value: 'uni-uc', label: 'University of California' },
  ];
  const domainOptions: TOption[] = [
    { value: 'domain-cs', label: 'Computer Science' },
    { value: 'domain-psych', label: 'Psychology' },
  ];

  const interestOptions: TOption[] = [
    { value: 'interest-home', label: 'Home Improvement' },
    { value: 'interest-martial', label: 'Martial Arts' },
    { value: 'interest-acro', label: 'Acroyoga' },
    { value: 'interest-astro', label: 'Amateur Astronomy' },
  ];
  const goalOptions: TOption[] = [
    { value: 'goal-masters', label: "Master's Foundation" },
    { value: 'goal-grade', label: 'Grade Booster' },
    { value: 'goal-captain', label: 'Study Squad Captain' },
    { value: 'goal-journal', label: 'Journal Regularly' },
  ];

  const profileQuery = useQuery({
    queryKey: ['me', 'profile-edit'],
    queryFn: getMyProfile,
  });

  const DISPLAY_NAME_MAX = 50;
  const ABOUT_MAX = 500;
  const LOOKING_FOR_MAX = 500;

  const form = useForm<TMyProfile>({
    initialValues: {
      email: '',
      userDisplayName: '',
      userAvatarUrl: null,

      userInfoPronounId: '',
      userInfoUniversityId: '',
      userInfoDomainId: '',

      userInfoBio: '',
      userInfoLookingFor: '',

      interestIds: [],
      personalGoalIds: [],
    },
    validate: {
      userDisplayName: (v) => (v.trim().length === 0 ? 'Display name is required' : null),
    },
  });

  React.useEffect(() => {
    if (!profileQuery.data) return;
    form.setValues(profileQuery.data);
    form.resetDirty();
  }, [profileQuery.data]);

  const saveMutation = useMutation({
    mutationFn: saveMyProfile,
    onSuccess: () => {
      form.resetDirty();
      profileQuery.refetch();
    },
    onError: (err) => {
      console.error('Save failed:', err);
    },
  });

  const handleSave = (values: TMyProfile) => {
    const payload: TUpdateMeProfileRo = {
      userDisplayName: values.userDisplayName || null,
      userInfoPronounId: values.userInfoPronounId || null,
      userInfoUniversityId: values.userInfoUniversityId || null,
      userInfoDomainId: values.userInfoDomainId || null,
      userInfoBio: values.userInfoBio || null,
      userInfoLookingFor: values.userInfoLookingFor || null,
      interestIds: values.interestIds.length ? values.interestIds : null,
      personalGoalIds: values.personalGoalIds.length ? values.personalGoalIds : null,
    };

    console.log('Submitting payload:', payload);
    saveMutation.mutate(payload);
  };

  if (profileQuery.isPending) return <Text>Loading…</Text>;
  if (profileQuery.isError) return <Text c='red'>Failed to load your profile.</Text>;

  const isDirty = form.isDirty();

  return (
    <Box p={PAGE_PADDING}>
      <Box maw={820} mx='auto'>
        {/* Header card */}
        <Paper radius='md' p={CARD_PADDING} mb={16}>
          <Group align='center' justify='space-between' wrap='nowrap'>
            <Group gap={16} wrap='nowrap'>
              <Avatar src={form.values.userAvatarUrl || undefined} size={64} radius='xl' />
              <Box>
                <Title order={4}>{form.values.userDisplayName || '—'}</Title>
                <Text size='xs' c='dimmed' mt={4}>
                  {[
                    pronounOptions.find((x) => x.value === form.values.userInfoPronounId)?.label,
                    uniOptions.find((x) => x.value === form.values.userInfoUniversityId)?.label,
                    domainOptions.find((x) => x.value === form.values.userInfoDomainId)?.label,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              </Box>
            </Group>

            <Group gap={10} wrap='nowrap'>
              <Button variant='filled' leftSection={<IconEdit size={16} />} radius='md' h={32}>
                Edit Profile
              </Button>
              <Button
                variant='light'
                color='gray'
                leftSection={<IconLock size={16} />}
                radius='md'
                h={32}
                disabled>
                Change Password
              </Button>
            </Group>
          </Group>
        </Paper>

        <form onSubmit={form.onSubmit(handleSave)}>
          {/* Main form card */}
          <Paper radius='md' p={CARD_PADDING}>
            <Stack gap={20}>
              {/* Email + change email */}
              <Flex justify='space-between' align='center' wrap='wrap' gap={12}>
                <Box>
                  <Text style={sectionTitleStyle}>Email</Text>
                  <Text mt={4} style={sectionBodyStyle}>
                    {form.values.email || '—'}
                  </Text>
                </Box>

                <Button
                  variant='light'
                  color='gray'
                  leftSection={<IconMail size={16} />}
                  radius='md'
                  h={32}
                  disabled>
                  Change Email
                </Button>
              </Flex>

              <Divider />

              {/* Display Name + Pronoun */}
              <Group align='flex-start' grow>
                <TextInput
                  label={<Text style={sectionTitleStyle}>Display Name</Text>}
                  placeholder='Your display name'
                  value={form.values.userDisplayName}
                  onChange={(e) =>
                    form.setFieldValue(
                      'userDisplayName',
                      e.currentTarget.value.slice(0, DISPLAY_NAME_MAX)
                    )
                  }
                  rightSection={
                    <Text size='xs' c='dimmed'>
                      {form.values.userDisplayName.length}/{DISPLAY_NAME_MAX}
                    </Text>
                  }
                  styles={{ label: { marginBottom: 6 } }}
                />

                <Select
                  label={<Text style={sectionTitleStyle}>Pronoun</Text>}
                  placeholder='Select'
                  data={pronounOptions}
                  value={form.values.userInfoPronounId}
                  onChange={(v) => form.setFieldValue('userInfoPronounId', v || '')}
                  styles={{ label: { marginBottom: 6 } }}
                />
              </Group>

              {/* University + Domain */}
              <Group align='flex-start' grow>
                <Select
                  label={<Text style={sectionTitleStyle}>University/College</Text>}
                  placeholder='Select'
                  data={uniOptions}
                  value={form.values.userInfoUniversityId}
                  onChange={(v) => form.setFieldValue('userInfoUniversityId', v || '')}
                  styles={{ label: { marginBottom: 6 } }}
                />

                <Select
                  label={<Text style={sectionTitleStyle}>Major/Domain</Text>}
                  placeholder='Select'
                  data={domainOptions}
                  value={form.values.userInfoDomainId}
                  onChange={(v) => form.setFieldValue('userInfoDomainId', v || '')}
                  styles={{ label: { marginBottom: 6 } }}
                />
              </Group>

              <Divider />

              {/* About */}
              <Box>
                <Text style={sectionTitleStyle}>About</Text>
                <Textarea
                  mt={8}
                  minRows={5}
                  value={form.values.userInfoBio}
                  onChange={(e) =>
                    form.setFieldValue('userInfoBio', e.currentTarget.value.slice(0, ABOUT_MAX))
                  }
                />
                <Text size='xs' c='dimmed' ta='right' mt={6}>
                  {form.values.userInfoBio.length}/{ABOUT_MAX}
                </Text>
              </Box>

              {/* Looking For */}
              <Box>
                <Text style={sectionTitleStyle}>Looking For</Text>
                <Textarea
                  mt={8}
                  minRows={4}
                  value={form.values.userInfoLookingFor}
                  onChange={(e) =>
                    form.setFieldValue(
                      'userInfoLookingFor',
                      e.currentTarget.value.slice(0, LOOKING_FOR_MAX)
                    )
                  }
                />
                <Text size='xs' c='dimmed' ta='right' mt={6}>
                  {form.values.userInfoLookingFor.length}/{LOOKING_FOR_MAX}
                </Text>
              </Box>

              {/* Interests */}
              <Box>
                <Text style={sectionTitleStyle}>Interests</Text>
                <MultiSelect
                  mt={8}
                  placeholder='Select interests'
                  data={interestOptions}
                  value={form.values.interestIds}
                  onChange={(v) => form.setFieldValue('interestIds', v)}
                  clearable
                  searchable
                />
              </Box>

              {/* Goals */}
              <Box>
                <Text style={sectionTitleStyle}>Personal Goals</Text>
                <MultiSelect
                  mt={8}
                  placeholder='Select goals'
                  data={goalOptions}
                  value={form.values.personalGoalIds}
                  onChange={(v) => form.setFieldValue('personalGoalIds', v)}
                  clearable
                  searchable
                />
              </Box>
            </Stack>
          </Paper>

          {/* Bottom unsaved changes bar */}
          {isDirty && (
            <Portal>
              <Box
                style={{
                  position: 'fixed',
                  left: 0,
                  right: 0,
                  bottom: 16,
                  zIndex: 999999,
                }}>
                <Box maw={820} mx='auto' px={PAGE_PADDING}>
                  <Paper radius='md' p='md' shadow='md'>
                    <Group justify='space-between' align='center' wrap='nowrap'>
                      <Text fw={600}>Careful, you have unsaved changes!</Text>

                      <Button
                        radius='md'
                        loading={saveMutation.isPending}
                        onMouseDown={() => console.log('mouseDown save')}
                        onClick={() => {
                          console.log('CLICK save');

                          const result = form.validate();
                          console.log('validate:', result);

                          if (result.hasErrors) {
                            console.log('Validation errors:', result.errors);
                            return;
                          }

                          const payload: TUpdateMeProfileRo = {
                            userDisplayName: form.values.userDisplayName || null,
                            userInfoPronounId: form.values.userInfoPronounId || null,
                            userInfoUniversityId: form.values.userInfoUniversityId || null,
                            userInfoDomainId: form.values.userInfoDomainId || null,
                            userInfoBio: form.values.userInfoBio || null,
                            userInfoLookingFor: form.values.userInfoLookingFor || null,
                            interestIds: form.values.interestIds.length
                              ? form.values.interestIds
                              : null,
                            personalGoalIds: form.values.personalGoalIds.length
                              ? form.values.personalGoalIds
                              : null,
                          };

                          console.log('Saving payload:', payload);
                          saveMutation.mutate(payload);
                        }}>
                        Save Changes
                      </Button>
                    </Group>
                  </Paper>
                </Box>
              </Box>
            </Portal>
          )}
        </form>
      </Box>
    </Box>
  );
}
