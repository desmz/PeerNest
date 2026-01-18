import z from 'zod';

import { TApiMethod } from '../types';

export const GET_ACHIEVEMENTS_METHOD: TApiMethod = 'get';

export const GET_ACHIEVEMENTS_URL = 'sys/achievements';

export const achievementSchema = z.object({
  achievementId: z.string().nonempty(),
  achievementTitle: z.string().nonempty(),
  achievementDescription: z.string().nonempty(),
  achievementCriteria: z.string().nonempty().nullable(),
  achievementPosition: z.string().nonempty(),
  achievementIsActive: z.boolean(),
  achievementType: z.string().nonempty(),
});

export type TAchievement = z.infer<typeof achievementSchema>;

export const achievementCategorySchema = z.object({
  achievementCategoryId: z.string().nonempty(),
  achievementCategoryName: z.string().nonempty(),
  achievementCategoryPosition: z.string().nonempty(),
});

export type TAchievementCategory = z.infer<typeof achievementCategorySchema>;

export const getAchievementsVoSchema = z.array(
  achievementCategorySchema.extend({
    achievements: z.array(achievementSchema),
  })
);

export type TGetAchievementsVo = z.infer<typeof getAchievementsVoSchema>;
