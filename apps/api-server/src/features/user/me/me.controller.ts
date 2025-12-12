import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Req } from '@nestjs/common';
import { changePasswordRoSchema, type TChangePasswordRo, type TMeVo } from '@peernest/contract';
import { type Request } from 'express';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { MeService } from './me.service';

@Controller('api/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request): Promise<TMeVo> {
    return req.user as TMeVo;
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body(new ZodValidationPipe(changePasswordRoSchema)) changePassword: TChangePasswordRo
  ): Promise<void> {
    await this.meService.changePassword(changePassword);
  }
}
