import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  sendFriendRequestRoSchema,
  type TAcceptFriendRequestParams,
  TAcceptFriendRequestVo,
  TSendFriendRequestVo,
  type TSendFriendRequestRo,
} from '@peernest/contract';

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
  ): Promise<TSendFriendRequestVo> {
    return this.friendshipService.sendFriendRequest(sendFriendRequestRo);
  }

  @Post('friend-requests/:requestId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptFriendRequest(
    @Param() acceptFriendRequestParams: TAcceptFriendRequestParams
  ): Promise<TAcceptFriendRequestVo> {
    return this.friendshipService.acceptFriendRequest(acceptFriendRequestParams);
  }
}
