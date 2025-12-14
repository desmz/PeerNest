import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  findUsersQueryParamsSchema,
  type TFindUsersVo,
  type TFindUsersQueryParams,
} from '@peernest/contract';

import { ZodValidationPipe } from '@/pipes/zod-validation.pipe';

import { UserService } from './user.service';

@Controller('api/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findUsers(
    @Query(new ZodValidationPipe(findUsersQueryParamsSchema))
    findUsersQueryParams: TFindUsersQueryParams
  ): Promise<TFindUsersVo> {
    return this.userService.findUsers(findUsersQueryParams);
  }
}
