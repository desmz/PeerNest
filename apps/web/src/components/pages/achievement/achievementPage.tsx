import { Text, Flex, Stack, Title, Button, Grid } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  GET_MY_ACHIEVEMENTS_URL,
  MARK_MY_ACHIEVEMENT_AS_VISIBLE_URL,
  markMyAchievementAsVisibleParamsSchema,
  TGetMyAchievementsVo,
  TMarkMyAchievementAsVisibleParams,
  urlBuilder,
} from '@peernest/contract';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import api from '@/lib/api-client';

function capitalizeFirstLetter(str: string) {
  return str
    .split(' ')
    .map((word) => {
      // Skip symbols like &, -, etc.
      if (!/^[a-zA-Z]/.test(word)) return word;

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// 1. call api
async function getAchv() {
  return api.get<TGetMyAchievementsVo>(GET_MY_ACHIEVEMENTS_URL);
}

async function updateVisible(params: TMarkMyAchievementAsVisibleParams) {
  const url = urlBuilder(MARK_MY_ACHIEVEMENT_AS_VISIBLE_URL, params);
  await api.patch<void>(url);
  console.log('success');
  console.log(params);
}

export default function AchievementPage() {
  // 2. data fetching library
  const { data: achvData } = useQuery({
    queryKey: ['achievements, userId'],
    queryFn: async () => {
      const res = await getAchv();
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  const markVisibleMutation = useMutation<void, Error, TMarkMyAchievementAsVisibleParams>({
    mutationFn: (params) => {
      markMyAchievementAsVisibleParamsSchema.parse(params);
      return updateVisible(params);
    },

    onSuccess: () => {
      notifications.show({
        message: 'Achievement is now visible!',
        color: 'green',
      });

      queryClient.invalidateQueries({
        queryKey: ['achievements, userId'],
      });
    },

    onError: () => {
      notifications.show({
        message: 'Error: Your Achievement is failed to update. Please try again.',
        color: 'red',
      });
    },
  });

  return (
    <Flex maw={'50%'} mx='auto' direction={'column'} w={'100%'}>
      <Stack p={'sm'} gap='md' w={608}>
        <Flex gap={'lg'}>
          <Text c='blue' fw={550} size='sm'>
            Pro tip: Click the Title to apply the achievements.
          </Text>
        </Flex>
        {achvData?.map((achvGrp) => (
          <Stack gap={8} key={achvGrp.achievementCategoryName}>
            <Title order={3}>{capitalizeFirstLetter(achvGrp.achievementCategoryName)}</Title>

            {achvGrp.achievements.map((achv) => {
              if (achv.isVisible) {
                return (
                  <Grid align='center' key={achv.achievementTitle}>
                    <Grid.Col span={4}>
                      <Button
                        p={0}
                        variant='subtle'
                        h='24'
                        size='sm'
                        fullWidth
                        justify='flex-start'
                        onClick={async () => {
                          notifications.show({
                            message: 'Error: This Achievement is already set to visible.',
                            color: 'red',
                          });
                        }}
                        styles={{
                          root: {
                            backgroundColor: 'transparent',
                            cursor: 'default',
                          },
                        }}>
                        {achv.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm' c={'blue'}>
                        {achv.achievementDescription}
                      </Text>
                    </Grid.Col>
                  </Grid>
                );
              } else if (achv.isUnlocked) {
                return (
                  <Grid align='center' key={achv.achievementTitle}>
                    <Grid.Col span={4}>
                      <Button
                        p={0}
                        variant='subtle'
                        h='24'
                        size='sm'
                        fullWidth
                        justify='flex-start'
                        c={'black'}
                        onClick={async () => {
                          try {
                            // WAIT for mutation to finish
                            await markVisibleMutation.mutateAsync({
                              achievementId: achv.achievementId,
                            });
                            // NOW refetch achievements
                            await queryClient.invalidateQueries({
                              queryKey: ['achievements, userId'],
                            });
                          } catch (e) {
                            console.error(e);
                          }
                        }}
                        styles={{
                          root: {
                            backgroundColor: 'transparent',
                            cursor: 'default',
                          },
                        }}>
                        {achv.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm'>{achv.achievementDescription}</Text>
                    </Grid.Col>
                  </Grid>
                );
              } else {
                return (
                  <Grid align='center' key={achv.achievementTitle}>
                    <Grid.Col span={4}>
                      <Button
                        p={0}
                        variant='subtle'
                        h='24'
                        size='sm'
                        fullWidth
                        justify='flex-start'
                        disabled
                        styles={{
                          root: {
                            backgroundColor: 'transparent',
                            cursor: 'default',
                          },
                        }}>
                        {achv.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm' c={'gray.5'}>
                        {achv.achievementDescription}
                      </Text>
                    </Grid.Col>
                  </Grid>
                );
              }
            })}
          </Stack>
        ))}
      </Stack>
    </Flex>
  );
}
