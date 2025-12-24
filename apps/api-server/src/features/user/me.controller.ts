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
import { type Request, type Response } from 'express';

import { clearCookie } from '@/features/auth/utils';
import { AvatarValidationPipe } from '@/pipes/avatar-file-validation.pipe';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { MeService } from './me.service';

@Controller('api/me')
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ): Promise<TMeVo> {
    // Disable caching
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

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

  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateMeProfile(
    @Body(new ZodValidationPipe(updateMeProfileRoSchema)) updateMeProfileRo: TUpdateMeProfileRo
  ): Promise<TUpdateMeProfileVo> {
    return this.meService.updateMeProfile(updateMeProfileRo);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getMeProfile(): Promise<TGetMeProfileVo> {
    return this.meService.getMeProfile();
  }

  @Patch('avatar')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatar(
    @UploadedFile(new AvatarValidationPipe({ fieldName: 'avatar' }))
    file: Express.Multer.File
  ) {
    await this.meService.updateAvatar(file);
  }
}
