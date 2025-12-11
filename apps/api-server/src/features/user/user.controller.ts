import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

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
}
