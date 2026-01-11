import z from 'zod';

import { TApiMethod } from '../types';
import { notificationIdSchema, notificationTypeIdSchema, zBoolean, zPosInt } from '../utils';

export const GET_MY_NOTIFICATIONS_METHOD: TApiMethod = 'get';

export const GET_MY_NOTIFICATIONS_URL = '/notifications/me';

export const getMyNotificationsQueryParamFields = {
  limit: 'Limit Query Param',
  offset: 'Offset Query Param',
  unReadonly: 'UnReadonly Query Param',
} as const;

export const getMyNotificationsQueryParamsSchema = z.object({
  limit: zPosInt(getMyNotificationsQueryParamFields.limit).nullish(),
  offset: zPosInt(getMyNotificationsQueryParamFields.offset).nullish(),
  unReadonly: z.boolean(zBoolean(getMyNotificationsQueryParamFields.unReadonly)).nullish(),
});

export type TGetMyNotificationsQueryParams = z.infer<typeof getMyNotificationsQueryParamsSchema>;

export const notificationTypeSchema = z.object({
  notificationTypeId: notificationTypeIdSchema(),
  notificationTypeName: z.string().nonempty(),
  notificationCategoryName: z.string().nonempty(),
});

export type TNotificationType = z.infer<typeof notificationTypeSchema>;

export const notificationSchema = z.object({
  notificationId: notificationIdSchema(),
  notificationTitle: z.string().nonempty(),
  notificationBody: z.string().nonempty(),
  notificationPayload: z.string().nonempty(),
  notificationCreatedTime: z.iso.datetime(),
  notificationSeenTime: z.iso.datetime().nullable(),
  notificationReadTime: z.iso.datetime().nullable(),
  notificationType: notificationTypeSchema,
});

export type TNotification = z.infer<typeof notificationSchema>;

export const getMyNotificationsVoSchema = z.object({
  meta: z.object({ count: z.int().positive(), unreadCount: z.int().positive() }),
  notifications: z.array(notificationSchema),
});

export type TGetMyNotificationsVo = z.infer<typeof getMyNotificationsVoSchema>;
