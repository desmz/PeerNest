import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { sendFriendRequestRoSchema, type TSendFriendRequestRo } from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { FriendShipService } from './friendship.service';

@Controller('api')
export class FriendShipController {
  constructor(private readonly friendshipService: FriendShipService) {}

  @Post('friend-requests')
  @HttpCode(HttpStatus.OK)
  async sendFriendRequest(
    @Body(new ZodValidationPipe(sendFriendRequestRoSchema))
    sendFriendRequestRo: TSendFriendRequestRo
  ) {
    return this.friendshipService.sendFriendRequest(sendFriendRequestRo);
  }
}
