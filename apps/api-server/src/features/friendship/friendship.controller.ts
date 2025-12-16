import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  sendFriendRequestRoSchema,
  type TAcceptFriendRequestParams,
  TAcceptFriendRequestVo,
  TSendFriendRequestVo,
  type TSendFriendRequestRo,
  type TRejectFriendRequestParams,
  getFriendRequestsQueryParamsSchema,
  type TGetFriendRequestQueryParams,
  TGetFriendRequestVo,
  type TUnfriendParams,
  TGetMyFriendsVo,
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

  @Post('friend-requests/:requestId/reject')
  @HttpCode(HttpStatus.NO_CONTENT)
  async rejectFriendRequest(
    @Param() rejectFriendRequestParams: TRejectFriendRequestParams
  ): Promise<void> {
    return this.friendshipService.rejectFriendRequest(rejectFriendRequestParams);
  }

  @Get('friend-requests')
  @HttpCode(HttpStatus.OK)
  async getFriendRequests(
    @Query(new ZodValidationPipe(getFriendRequestsQueryParamsSchema))
    getFriendRequestQueryParams: TGetFriendRequestQueryParams
  ): Promise<TGetFriendRequestVo> {
    return this.friendshipService.getFriendRequests(getFriendRequestQueryParams);
  }

  @Delete('me/friends/:friendId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfriend(@Param() unfriendParams: TUnfriendParams): Promise<void> {
    await this.friendshipService.unfriend(unfriendParams);
  }

  @Get('me/friends')
  @HttpCode(HttpStatus.OK)
  async getMyFriends(): Promise<TGetMyFriendsVo> {
    return this.friendshipService.getMyFriends();
  }
}
