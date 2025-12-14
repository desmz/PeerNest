import { Injectable } from '@nestjs/common';
import { TFindUsersQueryParams, TFindUsersVo } from '@peernest/contract';
import { ClsService } from 'nestjs-cls';

import { IClsStore } from '@/types/cls';

import { UserRepository } from './repos/user.repo';

@Injectable()
export class UserService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,
    private readonly userRepository: UserRepository
  ) {}

  async findUsers(findUsersQueryParams: TFindUsersQueryParams): Promise<TFindUsersVo> {
    const userId = this.clsService.get('user.id');
    const users = await this.userRepository.findUsers({
      ...findUsersQueryParams,
      excludedUserIds: [userId],
    });

    return {
      count: users.length,
      users,
    };
  }
}
