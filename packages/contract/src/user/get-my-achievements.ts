import z from 'zod';

import { achievementCategorySchema, achievementSchema } from '../system';
import { TApiMethod } from '../types';

export const GET_MY_ACHIEVEMENTS_METHOD: TApiMethod = 'get';

export const GET_MY_ACHIEVEMENTS_URL = '/me/achievements';

export const myAchievementSchema = achievementSchema
  .omit({
    achievementCriteria: true,
    achievementIsActive: true,
    achievementType: true,
  })
  .extend({
    isUnlocked: z.boolean(),
    isVisible: z.boolean(),
    awardedTime: z.iso.datetime().nullable(),
  });

export type TMyAchievement = z.infer<typeof myAchievementSchema>;

export const getMyAchievementsVoSchema = z.array(
  achievementCategorySchema.extend({
    achievements: z.array(myAchievementSchema),
  })
);

export type TGetMyAchievementsVo = z.infer<typeof getMyAchievementsVoSchema>;
