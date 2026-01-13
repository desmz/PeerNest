import z from 'zod';

import { TApiMethod } from '../types';
import { achievementIdSchema } from '../utils';

export const MARK_MY_ACHIEVEMENT_AS_VISIBLE_METHOD: TApiMethod = 'patch';

export const MARK_MY_ACHIEVEMENT_AS_VISIBLE_URL = '/me/achievements/{achievementId}/visible';

export const markMyAchievementAsVisibleParamsSchema = z.object({
  achievementId: achievementIdSchema(),
});

export type TMarkMyAchievementAsVisibleParams = z.infer<
  typeof markMyAchievementAsVisibleParamsSchema
>;
