import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import {
  approveBanRequestRoSchema,
  createBanRequestRoSchema,
  type TApproveBanRequestParams,
  type TApproveBanRequestRo,
  type TCreateBanRequestRo,
} from '@peernest/contract';
import { UserRole } from '@peernest/core';

import { Roles } from '@/features/auth/decorators/roles.decorator';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { BanService } from './ban.service';

@Controller('api/manage')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Roles(UserRole.Moderator)
  @Post('ban-requests')
  @HttpCode(HttpStatus.CREATED)
  async createBanRequest(
    @Body(new ZodValidationPipe(createBanRequestRoSchema)) createBanRequestRo: TCreateBanRequestRo
  ): Promise<void> {
    await this.banService.createBanRequest(createBanRequestRo);
  }

  @Roles(UserRole.Admin)
  @Post('ban-requests/:banRequestId/approve')
  @HttpCode(HttpStatus.NO_CONTENT)
  async approveBanRequest(
    @Param() approveBanRequestParams: TApproveBanRequestParams,
    @Body(new ZodValidationPipe(approveBanRequestRoSchema))
    approveBanRequestRo: TApproveBanRequestRo
  ): Promise<void> {
    await this.banService.approveBanRequest(approveBanRequestParams, approveBanRequestRo);
  }
}
