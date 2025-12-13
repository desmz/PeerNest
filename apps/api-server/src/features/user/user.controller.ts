import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';
import {
  changePasswordRoSchema,
  type TChangePasswordRo,
  type TMeVo,
  verifyChangeEmailRoSchema,
  type TVerifyChangeEmailRo,
  changeEmailRoSchema,
  type TChangeEmailRo,
  updateMeProfileRoSchema,
  type TUpdateMeProfileRo,
  type TUpdateMeProfileVo,
  TGetMeProfileVo,
} from '@peernest/contract';
import { type Request, type Response } from 'express';

import { clearCookie } from '@/features/auth/utils';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { UserService } from './user.service';

@Controller('api/me')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    await this.userService.changePassword(changePassword);
  }

  @Patch('email/verify-change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async verifyChangeEmail(
    @Body(new ZodValidationPipe(verifyChangeEmailRoSchema))
    verifyChangeEmailRo: TVerifyChangeEmailRo
  ): Promise<void> {
    await this.userService.verifyChangeEmail(verifyChangeEmailRo);
  }

  @Post('email/change')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeEmail(
    @Body(new ZodValidationPipe(changeEmailRoSchema)) changeEmailRo: TChangeEmailRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    await this.userService.changeEmail(changeEmailRo);
    clearCookie(res);
  }

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateMeProfile(
    @Body(new ZodValidationPipe(updateMeProfileRoSchema)) updateMeProfileRo: TUpdateMeProfileRo
  ): Promise<TUpdateMeProfileVo> {
    return this.userService.updateMeProfile(updateMeProfileRo);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getMeProfile(): Promise<TGetMeProfileVo> {
    return this.userService.getMeProfile();
  }
}
