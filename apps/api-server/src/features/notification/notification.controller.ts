import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  getMyNotificationsQueryParamsSchema,
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
}
