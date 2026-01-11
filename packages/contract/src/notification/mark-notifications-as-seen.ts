import z from 'zod';

import { TApiMethod } from '../types';
import { notificationIdSchema } from '../utils';

export const MARK_NOTIFICATIONS_AS_SEEN_METHOD: TApiMethod = 'patch';

export const MARK_NOTIFICATIONS_AS_SEEN_URL = '/notifications/seen';

export const markNotificationsAsSeenRoSchema = z.object({
  notificationIds: z.array(notificationIdSchema()).nullable(),
});

export type TMarkNotificationsAsSeenRo = z.infer<typeof markNotificationsAsSeenRoSchema>;
