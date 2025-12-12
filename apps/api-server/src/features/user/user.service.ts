import { Injectable } from '@nestjs/common';
import { TChangeEmailRo, TChangePasswordRo, TVerifyChangeEmailRo } from '@peernest/contract';
import {
  CHANGE_EMAIL_TOKEN_HASH_LENGTH,
  comparePassword,
  encodePassword,
  generateUserTokenId,
  getRandomString,
  HttpErrorCode,
  UserTokenType,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';
import ms from 'ms';
import { ClsService } from 'nestjs-cls';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { MailConfig, type TMailConfig } from '@/configs/mail.config';
import { CustomHttpException } from '@/custom.exception';
import { MailSenderService } from '@/features/mail-sender/mail-sender.service';
import { AccountRepository } from '@/features/user/repos/account.repo';
import { IClsStore } from '@/types/cls';

import { UserTokenRepository } from './repos/user-token.repo';
import { UserRepository } from './repos/user.repo';

@Injectable()
export class UserService {
  constructor(
    @AuthConfig() private readonly authConfig: TAuthConfig,
    @MailConfig() private readonly mailConfig: TMailConfig,
    private readonly clsService: ClsService<IClsStore>,
    private readonly kyselyService: KyselyService,

    private readonly accountRepository: AccountRepository,
    private readonly userRepository: UserRepository,
    private readonly userTokenRepository: UserTokenRepository,
    private readonly mailSenderService: MailSenderService
  ) {}

  async changePassword(changePassword: TChangePasswordRo) {
    const { oldPassword, newPassword } = changePassword;

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

  async verifyChangeEmail(verifyChangeEmailRo: TVerifyChangeEmailRo) {
    const { newEmail } = verifyChangeEmailRo;

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

    const existingUser = await this.userRepository.findUserByEmail(newEmail);

    if (existingUser) {
      throw new CustomHttpException(
        `User ${newEmail} is already registered or the account is deleted`,
        HttpErrorCode.CONFLICT
      );
    }

    const token = getRandomString(CHANGE_EMAIL_TOKEN_HASH_LENGTH);
    const now = new Date();

    await this.userTokenRepository.createUserToken({
      userTokenId: generateUserTokenId(),
      userTokenUserId: user.userId,
      userTokenType: UserTokenType.ChangeEmail,
      userTokenTokenHash: token,
      userTokenCreatedTime: now,
      userTokenExpiredTime: new Date(now.getTime() + ms(this.authConfig.generalToken.expiresIn)),
    });

    const changeEmailUrl = `${this.mailConfig.publicOrigin}/change-email?code=${token}`;
    const changeEmailOptions = await this.mailSenderService.changeEmailEmailOption({
      changeEmailUrl,
      userDisplayName: user.userDisplayName,
    });

    await this.mailSenderService.sendMail({ ...changeEmailOptions, to: newEmail });
  }

  async changeEmail(changeEmailRo: TChangeEmailRo) {
    const { code, newEmail } = changeEmailRo;
    const userId = this.clsService.get('user.id');

    // find user token
    const userToken = await this.userTokenRepository.findUserTokenByTokenHash(code);

    // throw error
    if (!userToken || userToken.userTokenType !== UserTokenType.ChangeEmail) {
      throw new CustomHttpException('Invalid token', HttpErrorCode.NOT_FOUND);
    }

    const now = new Date();
    if (userToken.userTokenExpiredTime < now) {
      throw new CustomHttpException('Token is expired', HttpErrorCode.VALIDATION_ERROR);
    }

    if (userId !== userToken.userTokenUserId) {
      throw new CustomHttpException('Invalid token', HttpErrorCode.NOT_FOUND);
    }

    await executeTx(this.kyselyService.db, async (tx) => {
      const now = new Date();
      await this.accountRepository.softDeleteSocialAccountsByUserId(userId, now, tx);

      await this.userRepository.updateUserById(
        {
          userEmail: newEmail,
          userUpdatedTime: now,
        },
        userId,
        tx
      );
    });
  }
}
