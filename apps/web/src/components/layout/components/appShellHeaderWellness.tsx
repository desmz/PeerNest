import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  Title,
  Chip,
  Box,
  Flex,
} from '@mantine/core';
import { TimeInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import {
  CREATE_WELLNESS_CHECK_IN_URL,
  createWellnessCheckInRoSchema,
  GET_WELLNESS_FACTORS_URL,
  GET_WELLNESS_MOODS_URL,
  GET_WELLNESS_SYMPTOMS_URL,
  TCreateWellnessCheckInRo,
  TCreateWellnessCheckInVo,
  TGetWellnessFactorsVo,
  TGetWellnessMoodsVo,
  TGetWellnessSymptomsVo,
} from '@peernest/contract';
import {
  dayjs,
  MAX_CHECK_IN_MOOD_RATING,
  MAX_CHECK_IN_SLEEP_QUALITY_RATING,
  MIN_CHECK_IN_MOOD_RATING,
} from '@peernest/core';
import { IconLogout } from '@tabler/icons-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import duration from 'dayjs/plugin/duration';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useMemo, useRef } from 'react';

import api from '@/lib/api-client';
import { capitalizeFirstLetterForFirstWord } from '@/lib/util';

dayjs.extend(duration);

type TProps = {
  opened: boolean;
  onClose: () => void;
  moods: TGetWellnessMoodsVo;
  symptoms: TGetWellnessSymptomsVo;
  factors: TGetWellnessFactorsVo;
};

const DEFAULT_COLOR_RATING = 5;
function timeToIsoDuration(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);

  return dayjs.duration({ hours, minutes, seconds: 0 }).toISOString();
}

async function createWellnessCheckIn(data: TCreateWellnessCheckInRo) {
  return await api.post<TCreateWellnessCheckInVo>(CREATE_WELLNESS_CHECK_IN_URL, data);
}

export function WellnessCheckInModal({ opened, onClose, moods, symptoms, factors }: TProps) {
  const queryClient = useQueryClient();
  const timePickerRef = useRef<HTMLInputElement>(null);

  const createWellnessCheckInForm = useForm<TCreateWellnessCheckInRo>({
    initialValues: {
      checkInCheckInTime: new Date(),
      checkInMoodRating: DEFAULT_COLOR_RATING,
      checkInSleepQualityRating: null,
      checkInSleepTime: null,
      wellnessMoodIds: null,
      wellnessSymptomIds: null,
      wellnessFactorIds: null,
      checkInHealthMeasurement: {
        heartRate: null,
        stepCount: null,
        weight: null,
      },
    },

    validate: zod4Resolver(createWellnessCheckInRoSchema),
  });

  const moodRating = createWellnessCheckInForm.values.checkInMoodRating;
  const ratingColor = moodRating ? `rating.${moodRating - 1}` : `rating.${DEFAULT_COLOR_RATING}`;

  const sleepQualityRating = createWellnessCheckInForm.values.checkInSleepQualityRating;
  const sleepQualityRatingColor = sleepQualityRating ? `rating.${sleepQualityRating}` : undefined;

  const moodOptions = useMemo(
    () =>
      moods.map((m) => ({
        value: m.wellnessMoodId,
        label: capitalizeFirstLetterForFirstWord(m.wellnessMoodName),
      })),
    [moods]
  );

  const symptomOptions = useMemo(
    () =>
      symptoms.map((sc) => ({
        ...sc,
        wellnessSymptomCategoryName: capitalizeFirstLetterForFirstWord(
          sc.wellnessSymptomCategoryName
        ),
        wellnessSymptoms: sc.wellnessSymptoms.map((s) => ({
          value: s.wellnessSymptomId,
          label: capitalizeFirstLetterForFirstWord(s.wellnessSymptomName),
        })),
      })),
    [symptoms]
  );

  const factorOptions = useMemo(
    () =>
      factors
        .filter((sc) => sc.wellnessFactorCategoryName !== 'sleep')
        .map((fc) => ({
          ...fc,
          wellnessFactorCategoryName: capitalizeFirstLetterForFirstWord(
            fc.wellnessFactorCategoryName
          ),
          wellnessFactors: fc.wellnessFactors.map((f) => ({
            value: f.wellnessFactorId,
            label: capitalizeFirstLetterForFirstWord(f.wellnessFactorName),
          })),
        })),
    [factors]
  );

  const sleepFactorOptions = useMemo(
    () =>
      factors
        .filter((sc) => sc.wellnessFactorCategoryName === 'sleep')
        .map((fc) => ({
          ...fc,
          wellnessFactorCategoryName: capitalizeFirstLetterForFirstWord(
            fc.wellnessFactorCategoryName
          ),
          wellnessFactors: fc.wellnessFactors.map((f) => ({
            value: f.wellnessFactorId,
            label: capitalizeFirstLetterForFirstWord(f.wellnessFactorName),
          })),
        })),
    [factors]
  );

  const createWellnessCheckInMutation = useMutation<
    TCreateWellnessCheckInVo,
    { error: { message: string } },
    TCreateWellnessCheckInRo
  >({
    mutationFn: async (data: TCreateWellnessCheckInRo) => {
      const res = await createWellnessCheckIn(data);
      return res.data;
    },
    onSuccess: (data) => {
      onClose();
      createWellnessCheckInForm.reset();
    },
    onError: (err) => {
      notifications.show({
        message: err.error.message,
        color: 'red',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['wellness'],
      });
    },
  });

  function onCreateWellnessCheckInSubmit(data: TCreateWellnessCheckInRo) {
    createWellnessCheckInMutation.mutate(data);
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={720}
      radius='lg'
      withCloseButton
      overlayProps={{ blur: 2 }}
      centered
      padding={'lg'}
      styles={{
        header: { paddingBottom: 0, paddingTop: 0 },
      }}>
      <Flex gap={'lg'} direction={'column'}>
        {/* header */}
        <Stack
          gap={4}
          mb='md'
          style={{
            borderBottom: '1px solid #E9ECEF',
          }}
          pb={'sm'}>
          <Text size='sm' c='dimmed'>
            Today, {new Date().toLocaleDateString()}
          </Text>
          <Title order={3} fw={600}>
            Daily check-in
          </Title>
          <Text size='xs' c='dimmed'>
            Reflect on how your day felt overall.
          </Text>
        </Stack>

        <form onSubmit={createWellnessCheckInForm.onSubmit(onCreateWellnessCheckInSubmit)}>
          <Stack gap='48'>
            {/* mood */}
            <Box>
              <Text fz={'lg'} fw={600}>
                Rate your mood
              </Text>
              <Text size='xs' c='dimmed'>
                {MIN_CHECK_IN_MOOD_RATING} = really low, {MAX_CHECK_IN_MOOD_RATING} = really good
              </Text>

              <Chip.Group
                value={createWellnessCheckInForm.values.checkInMoodRating.toString()}
                onChange={(value) => {
                  createWellnessCheckInForm.setFieldValue('checkInMoodRating', Number(value));
                }}>
                <Group gap='xs' mt={12}>
                  {Array.from({ length: MAX_CHECK_IN_MOOD_RATING }).map((_, i) => {
                    const rating = i + 1;

                    return (
                      <Chip
                        key={rating}
                        value={rating.toString()}
                        color={`rating.${String(i)}`}
                        variant='light'
                        icon={null}
                        fw={700}
                        radius={'sm'}
                        styles={{
                          label: {
                            fontSize: 20,
                            paddingBlock: 24,
                            paddingInline: 16,
                          },
                        }}>
                        {rating}
                      </Chip>
                    );
                  })}
                </Group>
              </Chip.Group>
            </Box>

            {/* feelings */}
            <Box>
              <Text fz={'lg'} fw={600}>
                {' '}
                Add feelings
              </Text>
              <Text size='xs' c='dimmed'>
                How do you feels?
              </Text>

              <Chip.Group
                value={createWellnessCheckInForm.values.wellnessMoodIds || undefined}
                onChange={(values) =>
                  createWellnessCheckInForm.setFieldValue('wellnessMoodIds', values)
                }
                multiple>
                <Group gap='xs' mt={12}>
                  {moodOptions.map((m) => (
                    <Chip
                      key={m.value}
                      value={m.value}
                      variant='light'
                      radius={'sm'}
                      icon={null}
                      color={ratingColor}
                      styles={{
                        label: {
                          paddingInline: 12,
                        },
                      }}>
                      {m.label}
                    </Chip>
                  ))}
                </Group>
              </Chip.Group>
            </Box>

            {/* symptoms */}
            <Box>
              <Text fz={'lg'} fw={600}>
                Add symptoms
              </Text>
              <Text size='xs' c='dimmed'>
                How are your symptoms at their worst today?
              </Text>
              <Chip.Group
                value={createWellnessCheckInForm.values.wellnessSymptomIds || undefined}
                onChange={(values) =>
                  createWellnessCheckInForm.setFieldValue('wellnessSymptomIds', values)
                }
                multiple>
                <Stack mt={12} gap={'lg'}>
                  {symptomOptions.map((sc) => (
                    <Box key={sc.wellnessSymptomCategoryId}>
                      <Text fw={600}>{sc.wellnessSymptomCategoryName}</Text>
                      <Group gap='xs' mt={4}>
                        {sc.wellnessSymptoms.map((s) => (
                          <Chip
                            key={s.value}
                            value={s.value}
                            variant='light'
                            radius={'sm'}
                            icon={null}
                            color={ratingColor}
                            styles={{
                              label: {
                                paddingInline: 12,
                              },
                            }}>
                            {s.label}
                          </Chip>
                        ))}
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Chip.Group>
            </Box>

            {/* factors */}
            <Box>
              <Text fz={'lg'} fw={600}>
                Add factors
              </Text>
              <Text size='xs' c='dimmed'>
                How are you doing today?
              </Text>
              <Chip.Group
                value={createWellnessCheckInForm.values.wellnessFactorIds || undefined}
                onChange={(values) =>
                  createWellnessCheckInForm.setFieldValue('wellnessFactorIds', values)
                }
                multiple>
                <Stack mt={12} gap={'lg'}>
                  {factorOptions.map((fc) => (
                    <Box key={fc.wellnessFactorCategoryId}>
                      <Text fw={600}>{fc.wellnessFactorCategoryName}</Text>
                      <Group gap='xs' mt={4}>
                        {fc.wellnessFactors.map((f) => (
                          <Chip
                            key={f.value}
                            value={f.value}
                            variant='light'
                            radius={'sm'}
                            icon={null}
                            color={ratingColor}
                            styles={{
                              label: {
                                paddingInline: 12,
                              },
                            }}>
                            {f.label}
                          </Chip>
                        ))}
                      </Group>
                    </Box>
                  ))}
                </Stack>
              </Chip.Group>
            </Box>

            <Box>
              <Text fz={'lg'} fw={600}>
                Sleep (last night)
              </Text>
              <Text size='xs' c='dimmed'>
                How were your sleeping quality{' '}
                <strong style={{ color: 'black' }}>last night</strong>?
              </Text>

              <Stack mt={12}>
                {/* sleep quality rating */}
                <Box>
                  <Text fw={600}>Sleep quality</Text>
                  <Chip.Group
                    value={createWellnessCheckInForm.values.checkInSleepQualityRating?.toString()}
                    onChange={(value) =>
                      createWellnessCheckInForm.setFieldValue(
                        'checkInSleepQualityRating',
                        Number(value)
                      )
                    }>
                    <Group gap='xs' mt={12}>
                      {Array.from({ length: MAX_CHECK_IN_SLEEP_QUALITY_RATING }).map((_, i) => {
                        const rating = i + 1;

                        return (
                          <Chip
                            key={rating}
                            value={rating.toString()}
                            color={`rating.${String(i * 2)}`}
                            variant='light'
                            icon={null}
                            fw={700}
                            radius={'sm'}
                            styles={{
                              label: {
                                fontSize: 20,
                                paddingBlock: 24,
                                paddingInline: 16,
                              },
                            }}>
                            {rating}
                          </Chip>
                        );
                      })}
                    </Group>
                  </Chip.Group>
                </Box>

                {/* time asleep */}
                <Box>
                  <TimeInput
                    label={
                      <Text fw={600} mb={12}>
                        Time asleep (hr:min)
                      </Text>
                    }
                    ref={timePickerRef}
                    w={240}
                    onChange={(e) => {
                      if (!e) return;

                      createWellnessCheckInForm.setFieldValue(
                        'checkInSleepTime',
                        timeToIsoDuration(e.currentTarget.value)
                      );
                    }}
                    key={createWellnessCheckInForm.key('checkInSleepTime')}
                  />
                </Box>

                {/* sleep factor */}
                <Box>
                  <Text fw={600}>Sleep factors</Text>
                  <Chip.Group
                    value={createWellnessCheckInForm.values.wellnessFactorIds || undefined}
                    onChange={(values) =>
                      createWellnessCheckInForm.setFieldValue('wellnessFactorIds', values)
                    }
                    multiple>
                    <Stack mt={12} gap={'lg'}>
                      {sleepFactorOptions.map((fc) => (
                        <Box key={fc.wellnessFactorCategoryId}>
                          <Group gap='xs' mt={4}>
                            {fc.wellnessFactors.map((f) => (
                              <Chip
                                key={f.value}
                                value={f.value}
                                disabled={sleepQualityRating === null}
                                variant='light'
                                radius={'sm'}
                                icon={null}
                                color={sleepQualityRatingColor}
                                styles={{
                                  label: {
                                    paddingInline: 12,
                                  },
                                }}>
                                {f.label}
                              </Chip>
                            ))}
                          </Group>
                        </Box>
                      ))}
                    </Stack>
                  </Chip.Group>
                </Box>
              </Stack>
            </Box>

            {/* health measurement */}
            <Box>
              <Text fz={'lg'} fw={600}>
                Health measurement
              </Text>
              <Flex mt={12} justify={'space-between'} gap={'md'}>
                <NumberInput
                  label={<Text fw={600}>Heart rate (bpm)</Text>}
                  placeholder='bpm'
                  allowDecimal={false}
                  min={30}
                  max={230}
                  key={createWellnessCheckInForm.key('checkInHealthMeasurement.heartRate')}
                  onChange={(value) =>
                    createWellnessCheckInForm.setFieldValue(
                      'checkInHealthMeasurement.heartRate',
                      Number(value)
                    )
                  }
                />
                <NumberInput
                  label={<Text fw={600}>Step count (steps)</Text>}
                  placeholder='steps'
                  allowDecimal={false}
                  min={0}
                  max={200_00}
                  key={createWellnessCheckInForm.key('checkInHealthMeasurement.stepCount')}
                  onChange={(value) =>
                    createWellnessCheckInForm.setFieldValue(
                      'checkInHealthMeasurement.stepCount',
                      Number(value)
                    )
                  }
                />
                <NumberInput
                  label={<Text fw={600}>Weight (kg)</Text>}
                  placeholder='kg'
                  decimalScale={2}
                  min={0}
                  max={400}
                  key={createWellnessCheckInForm.key('checkInHealthMeasurement.weight')}
                  onChange={(value) =>
                    createWellnessCheckInForm.setFieldValue(
                      'checkInHealthMeasurement.weight',
                      Number(value)
                    )
                  }
                />
              </Flex>
            </Box>

            {/* actions */}
            <Group justify='flex-end' mt='md'>
              <Button
                type='submit'
                radius='md'
                loading={createWellnessCheckInMutation.isPending}
                size='md'>
                Done
              </Button>
            </Group>
          </Stack>
        </form>
      </Flex>
    </Modal>
  );
}

async function getWellnessMoods() {
  return await api.get<TGetWellnessMoodsVo>(GET_WELLNESS_MOODS_URL);
}
async function getWellnessSymptoms() {
  return await api.get<TGetWellnessSymptomsVo>(GET_WELLNESS_SYMPTOMS_URL);
}
async function getWellnessFactors() {
  return await api.get<TGetWellnessFactorsVo>(GET_WELLNESS_FACTORS_URL);
}

export default function AppShellHeaderWellness() {
  const [opened, handler] = useDisclosure(false);

  const { data: moodData } = useQuery({
    queryKey: ['wellness', 'moods'],
    queryFn: async () => {
      return (await getWellnessMoods()).data;
    },
  });
  const { data: symptomData } = useQuery({
    queryKey: ['wellness', 'symptoms'],
    queryFn: async () => {
      return (await getWellnessSymptoms()).data;
    },
  });
  const { data: factorData } = useQuery({
    queryKey: ['wellness', 'factors'],
    queryFn: async () => {
      return (await getWellnessFactors()).data;
    },
  });

  return (
    <Flex w={'100%'} justify={'flex-end'} align={'center'} px={'md'}>
      <Button onClick={handler.open} rightSection={<IconLogout />}>
        Check In
      </Button>
      <WellnessCheckInModal
        opened={opened}
        moods={moodData ?? []}
        symptoms={symptomData ?? []}
        factors={factorData ?? []}
        onClose={() => handler.close()}
      />
    </Flex>
  );
}
