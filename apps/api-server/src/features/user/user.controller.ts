import { Controller, Get, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { TSelectableUser } from '@peernest/db';
import { type Request } from 'express';

import { Public } from '@/features/auth/decorators/public.decorator';

@Controller('api/users')
export class UserController {
  // constructor(private readonly userService: UserService) {}

  @Public()
  @Get()
  @HttpCode(HttpStatus.OK)
  async testing() {
    return { testing: 'Hello world' };
  }

  @Get('/me')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Req() req: Request): Promise<TSelectableUser> {
    return req.user as TSelectableUser;
  }
}
