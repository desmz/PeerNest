import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  forgetPasswordRoSchema,
  resetPasswordRoSchema,
  signInRoSchema,
  signUpRoSchema,
  type TResetPasswordRo,
  type TForgetPasswordRo,
  type TSignInRo,
  type TSignUpRo,
} from '@peernest/contract';
import { type Request, type Response } from 'express';

import { AppConfig, type TAppConfig } from '@/configs/app.config';
import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { GoogleGuard } from './guards/google.guard';
import { TGoogleAuthRo } from './types/social-auth.type';
import { clearCookie, setAuthCookie } from './utils';

@Controller('api/auth')
export class AuthController {
  constructor(
    @AppConfig() private readonly appConfig: TAppConfig,

    private readonly authService: AuthService
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post('/signup')
  async signup(
    @Body(new ZodValidationPipe(signUpRoSchema)) userRo: TSignUpRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken } = await this.authService.signup(userRo);

    setAuthCookie(res, accessToken);
  }

  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('signin')
  async signIn(
    @Body(new ZodValidationPipe(signInRoSchema)) userRo: TSignInRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken } = await this.authService.signIn(userRo);

    setAuthCookie(res, accessToken);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async googleAuthenticate() {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Get('google/callback')
  @UseGuards(GoogleGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const { accessToken } = await this.authService.googleAuthenticateCallback(
      req.user as TGoogleAuthRo
    );

    setAuthCookie(res, accessToken);
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    return res.redirect(this.appConfig.publicOrigin);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('signout')
  async signout(@Res({ passthrough: true }) res: Response): Promise<void> {
    clearCookie(res);
  }

  @Public()
  @Post('forget-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async forgetPassword(
    @Body(new ZodValidationPipe(forgetPasswordRoSchema)) forgetPasswordRo: TForgetPasswordRo
  ): Promise<void> {
    await this.authService.forgetPassword(forgetPasswordRo);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body(new ZodValidationPipe(resetPasswordRoSchema)) resetPasswordRo: TResetPasswordRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken } = await this.authService.resetPassword(resetPasswordRo);

    setAuthCookie(res, accessToken);
  }
}
