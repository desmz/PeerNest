import { Injectable } from '@nestjs/common';
import { TChangePasswordRo } from '@peernest/contract';
import { comparePassword, encodePassword, HttpErrorCode } from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { IClsStore } from '@/types/cls';

import { UserRepository } from '../repos/user.repo';

@Injectable()
export class MeService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,
    private readonly userRepository: UserRepository
  ) {}

  async changePassword(changePassword: TChangePasswordRo) {
    const { oldPassword, newPassword } = changePassword;

    console.log(this.clsService.get('user'));
    const userId = this.clsService.get('user.id');

    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new CustomHttpException(
        `User ${userId} has not registered yet or the account is deleted`,
        HttpErrorCode.INVALID_CREDENTIALS
      );
    }

    if (!user.userPasswordHash) {
      throw new CustomHttpException(
        `Please sign in with Google or other options`,
        HttpErrorCode.INVALID_CREDENTIALS
      );
    }

    const isPasswordValid = await comparePassword(oldPassword, user.userPasswordHash);

    if (!isPasswordValid) {
      throw new CustomHttpException('Invalid password', HttpErrorCode.INVALID_CREDENTIALS);
    }

    const newPasswordHash = await encodePassword(newPassword);
    const now = new Date();
    await this.userRepository.updateUserById(
      {
        userPasswordHash: newPasswordHash,
        userUpdatedTime: now,
      },
      userId
    );

    // todo: optionally, send the email to inform the user
  }
}
