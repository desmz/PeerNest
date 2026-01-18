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
import { useAtom } from 'jotai';

import { currentUserAtom } from '@/features/user/atoms/current-user.atom';
import api from '@/lib/api-client';
import { capitalizeFirstLetter } from '@/lib/util';

async function getMyAchievements() {
  return api.get<TGetMyAchievementsVo>(GET_MY_ACHIEVEMENTS_URL);
}

async function updateVisible(params: TMarkMyAchievementAsVisibleParams) {
  const url = urlBuilder(MARK_MY_ACHIEVEMENT_AS_VISIBLE_URL, params);
  await api.patch<void>(url);
}

export default function AchievementPage() {
  const [currentUser] = useAtom(currentUserAtom);
  const userId = currentUser?.id;

  const { data: achievementData } = useQuery({
    queryKey: ['achievements', userId],
    queryFn: async () => {
      const res = await getMyAchievements();
      return res.data;
    },
  });

  const queryClient = useQueryClient();

  const markVisibleMutation = useMutation<
    void,
    Error,
    TMarkMyAchievementAsVisibleParams,
    { previousData: TGetMyAchievementsVo | undefined }
  >({
    mutationFn: (params) => {
      markMyAchievementAsVisibleParamsSchema.parse(params);
      return updateVisible(params);
    },

    onMutate: async ({ achievementId }) => {
      await queryClient.cancelQueries({ queryKey: ['achievements', userId] });

      const previousData = queryClient.getQueryData<TGetMyAchievementsVo>(['achievements', userId]);

      queryClient.setQueryData<TGetMyAchievementsVo>(['achievements', userId], (old) => {
        if (!old) return old;

        return old.map((group) => ({
          ...group,
          achievements: group.achievements.map((a) =>
            a.achievementId === achievementId ? { ...a, isVisible: true } : a
          ),
        }));
      });

      return { previousData };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(['achievements', userId], ctx.previousData);
      }

      notifications.show({
        message: 'Error: Your Achievement failed to update.',
        color: 'red',
      });
    },

    onSuccess: () => {
      notifications.show({
        message: 'Achievement is now visible!',
        color: 'green',
      });
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['achievements', userId],
      });
    },
  });

  const onMarkVisibleClick = async (data: { achievementId: string }) => {
    await markVisibleMutation.mutateAsync(data);
  };

  return (
    <Flex mx='auto' maw={640} direction={'column'} w={'100%'} bg={'white'} p={16} bdrs={'lg'}>
      <Stack p={'sm'} gap='md' w={608}>
        <Flex gap={'lg'}>
          <Text c='blue' fw={550} size='sm'>
            Pro tip: Click the Title to apply the achievements.
          </Text>
        </Flex>
        {achievementData?.map((achievementGroup) => (
          <Stack gap={8} key={achievementGroup.achievementCategoryName}>
            <Title order={3}>
              {capitalizeFirstLetter(achievementGroup.achievementCategoryName)}
            </Title>

            {achievementGroup.achievements.map((achievement) => {
              if (achievement.isVisible) {
                return (
                  <Grid align='center' key={achievement.achievementTitle}>
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
                        {achievement.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm' c={'blue'}>
                        {achievement.achievementDescription}
                      </Text>
                    </Grid.Col>
                  </Grid>
                );
              } else if (achievement.isUnlocked) {
                console.log(achievement.achievementTitle);
                return (
                  <Grid align='center' key={achievement.achievementTitle}>
                    <Grid.Col span={4}>
                      <Button
                        p={0}
                        variant='subtle'
                        h='24'
                        size='sm'
                        fullWidth
                        justify='flex-start'
                        c={'black'}
                        onClick={() =>
                          onMarkVisibleClick({ achievementId: achievement.achievementId })
                        }
                        styles={{
                          root: {
                            backgroundColor: 'transparent',
                            cursor: 'default',
                            color: 'black',
                          },
                        }}>
                        {achievement.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm'>{achievement.achievementDescription}</Text>
                    </Grid.Col>
                  </Grid>
                );
              } else {
                return (
                  <Grid align='center' key={achievement.achievementTitle}>
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
                            cursor: 'not-allowed',
                          },
                        }}>
                        {achievement.achievementTitle}
                      </Button>
                    </Grid.Col>
                    <Grid.Col span={8}>
                      <Text size='sm' c={'gray.5'}>
                        {achievement.achievementDescription}
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
