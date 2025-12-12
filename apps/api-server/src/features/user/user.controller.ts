import { Body, Controller, Get, HttpCode, HttpStatus, Patch, Post, Req, Res } from '@nestjs/common';
import {
  changePasswordRoSchema,
  type TChangePasswordRo,
  type TMeVo,
  verifyChangeEmailRoSchema,
  type TVerifyChangeEmailRo,
  changeEmailRoSchema,
  type TChangeEmailRo,
} from '@peernest/contract';
import { type Request, type Response } from 'express';

import { clearCookie } from '@/features/auth/utils';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { UserService } from './user.service';

@Controller('api/me')
export class UserController {
  constructor(private readonly meService: UserService) {}

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

  @Patch('email/verify-change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyChangeEmail(
    @Body(new ZodValidationPipe(verifyChangeEmailRoSchema))
    verifyChangeEmailRo: TVerifyChangeEmailRo
  ): Promise<void> {
    await this.meService.verifyChangeEmail(verifyChangeEmailRo);
  }

  @Post('email/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeEmail(
    @Body(new ZodValidationPipe(changeEmailRoSchema)) changeEmailRo: TChangeEmailRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.meService.changeEmail(changeEmailRo);
    clearCookie(res);
  }
}
