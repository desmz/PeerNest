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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { ALLOWED_AVATAR_EXT, MAX_AVATAR_SIZE } from '@peernest/core';
import { type Request, type Response } from 'express';

import { clearCookie } from '@/features/auth/utils';
import { FileValidationPipe } from '@/pipes/file-validation.pipe';
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

  @Patch('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @UploadedFile(
      new FileValidationPipe({
        maxFileSize: MAX_AVATAR_SIZE,
        allowedFileExt: ALLOWED_AVATAR_EXT,
        fieldName: 'avatar',
      })
    )
    file: Express.Multer.File
  ) {
    await this.userService.updateAvatar(file);
  }
}
