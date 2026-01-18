import z from 'zod';

import { TApiMethod } from '../types';
import { notificationIdSchema } from '../utils';

export const MARK_NOTIFICATION_AS_READ_METHOD: TApiMethod = 'patch';

export const MARK_NOTIFICATION_AS_READ_URL = '/notifications/{notificationId}/read';

export const markNotificationAsReadParamsSchema = z.object({
  notificationId: notificationIdSchema(),
});

export type TMarkNotificationAsReadParams = z.infer<typeof markNotificationAsReadParamsSchema>;
