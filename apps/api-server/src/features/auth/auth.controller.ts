import { Body, Controller, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { signInRoSchema, signUpRoSchema, type TSignInRo, type TSignUpRo } from '@peernest/contract';
import { type Response } from 'express';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
// import { GoogleGuard } from './guards/google.guard';
// import { GoogleAuthRo } from './types/social-auth.type';
import { setAuthCookie } from './utils';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @Post('/signin')
  async signIn(
    @Body(new ZodValidationPipe(signInRoSchema)) userRo: TSignInRo,
    @Res({ passthrough: true }) res: Response
  ): Promise<void> {
    const { accessToken } = await this.authService.signIn(userRo);

    setAuthCookie(res, accessToken);
  }

  // @Public()
  // @Get('google')
  // @UseGuards(GoogleGuard)
  // // eslint-disable-next-line @typescript-eslint/no-empty-function
  // async googleAuthenticate() {}

  // @Public()
  // @HttpCode(HttpStatus.OK)
  // @Get('google/callback')
  // @UseGuards(GoogleGuard)
  // async googleCallback(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  //   const { accessToken } = await this.authService.googleAuthenticateCallback(
  //     req.user as GoogleAuthRo
  //   );

  //   setAuthCookie(res, accessToken, this.environmentService);
  //   res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  //   res.redirect('http://localhost:3001');
  // }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('signout')
  async signout(@Res({ passthrough: true }) res: Response): Promise<void> {
    res.clearCookie('authToken');
  }
}
