import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Query } from '@nestjs/common';
import {
  getMyNotificationsQueryParamsSchema,
  markNotificationsAsSeenRoSchema,
  type TMarkNotificationsAsSeenRo,
  type TGetMyNotificationsQueryParams,
  type TGetMyNotificationsVo,
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { NotificationService } from './services/notification.service';

@Controller('api/notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getMyNotifications(
    @Query(new ZodValidationPipe(getMyNotificationsQueryParamsSchema))
    getMyNotificationsQueryParams: TGetMyNotificationsQueryParams
  ): Promise<TGetMyNotificationsVo> {
    return this.notificationService.getMyNotifications(getMyNotificationsQueryParams);
  }

  @Patch('seen')
  @HttpCode(HttpStatus.NO_CONTENT)
  async markNotificationsAsSeen(
    @Body(new ZodValidationPipe(markNotificationsAsSeenRoSchema))
    markNotificationsAsSeenRo: TMarkNotificationsAsSeenRo
  ): Promise<void> {
    await this.notificationService.markNotificationsAsSeen(markNotificationsAsSeenRo);
  }
}
