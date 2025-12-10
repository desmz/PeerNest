import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { type TMeVo } from '@peernest/contract';
import { type Request } from 'express';

import { Public } from '@/features/auth/decorators/public.decorator';

import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async testing() {
    this.userService.testing();
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request): Promise<TMeVo> {
    return req.user as TMeVo;
  }
}
