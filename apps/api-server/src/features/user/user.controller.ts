import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';

import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async testing() {
    return this.userService.testing();
  }
}
