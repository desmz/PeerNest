import { Injectable } from '@nestjs/common';
import {
  TChangeEmailRo,
  TChangePasswordRo,
  TUpdateMeProfileRo,
  TVerifyChangeEmailRo,
} from '@peernest/contract';
import {
  CHANGE_EMAIL_TOKEN_HASH_LENGTH,
  comparePassword,
  encodePassword,
  generateUserInfoInterestId,
  generateUserInfoPersonalGoalId,
  generateUserTokenId,
  getRandomString,
  HttpErrorCode,
  UserTokenType,
} from '@peernest/core';
import {
  executeTx,
  KyselyService,
  TInsertableUserInfoInterest,
  TInsertableUserInfoPersonalGoal,
  TUpdatableUserInfoInterest,
  TUpdatableUserInfoPersonalGoal,
} from '@peernest/db';
import ms from 'ms';
import { ClsService } from 'nestjs-cls';

import { AuthConfig, type TAuthConfig } from '@/configs/auth.config';
import { MailConfig, type TMailConfig } from '@/configs/mail.config';
import { CustomHttpException } from '@/custom.exception';
import { MailSenderService } from '@/features/mail-sender/mail-sender.service';
import { InterestRepository } from '@/features/system/repos/interest.repo';
import { PersonalGoalRepository } from '@/features/system/repos/personal-goal.repo';
import { AccountRepository } from '@/features/user/repos/account.repo';
import { IClsStore } from '@/types/cls';

import { UserInfoInterestRepository } from './repos/user-info-interest.repo';
import { UserInfoPersonalGoalRepository } from './repos/user-info-personal-goal.repo';
import { UserInfoRepository } from './repos/user-info.repo';
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
    private readonly interestRepository: InterestRepository,
    private readonly personalGoalRepository: PersonalGoalRepository,
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository,
    private readonly userInfoInterestRepository: UserInfoInterestRepository,
    private readonly userInfoPersonalGoalRepository: UserInfoPersonalGoalRepository,
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

  async updateMeProfile(updateMeProfileRo: TUpdateMeProfileRo) {
    const { userDisplayName, interestIds, personalGoalIds, ...otherUpdateMeProfileRo } =
      updateMeProfileRo;

    const userId = this.clsService.get('user.id');

    const userInfo = await this.userInfoRepository.findUserInfoByUserId(userId);

    if (!userInfo) {
      throw new CustomHttpException('User info is not found', HttpErrorCode.NOT_FOUND);
    }

    const systemInterestRows = await this.interestRepository.findInterests();
    const systemInterest = new Set(
      systemInterestRows.map((systemInterestRow) => systemInterestRow.interestId)
    );
    const filteredInterestIds = interestIds?.filter((interestId) => systemInterest.has(interestId));

    const systemPersonalGoalRows = await this.personalGoalRepository.findPersonalGoals();
    const systemPersonalGoal = new Set(
      systemPersonalGoalRows.map((systemPersonalGoalRow) => systemPersonalGoalRow.personalGoalId)
    );
    const filteredPersonalGoalIds = personalGoalIds?.filter((personalGoalId) =>
      systemPersonalGoal.has(personalGoalId)
    );

    const userInfoId = userInfo.userInfoId;
    await executeTx(this.kyselyService.db, async (tx) => {
      const now = new Date();

      if (userDisplayName) {
        await this.userRepository.updateUserById(
          { userDisplayName, userUpdatedTime: now },
          userId,
          tx
        );
      }

      await this.userInfoRepository.updateUserInfoById(
        { ...otherUpdateMeProfileRo, userInfoUpdatedTime: now },
        userInfoId,
        tx
      );

      if (filteredInterestIds && filteredInterestIds.length > 0) {
        await this.userInfoInterestRepository.deleteUserInfoInterests(
          {
            userInfoInterestUserInfoId: userInfoId,
            userInfoInterestInterestIds: filteredInterestIds,
          },
          { isExcludeInterestIds: true },
          tx
        );

        let basePos = await this.userInfoInterestRepository.findMaxPositionByUserInfoId(
          userInfoId,
          tx
        );

        if (basePos === -1) {
          basePos = 0;
        }

        const userInfoInterestObjs: TInsertableUserInfoInterest[] = filteredInterestIds.map(
          (interestId, idx) => ({
            userInfoInterestId: generateUserInfoInterestId(),
            userInfoInterestUserInfoId: userInfoId,
            userInfoInterestInterestId: interestId,
            userInfoInterestPosition: basePos + idx + 1,
            userInfoInterestCreatedTime: now,
          })
        );

        const userInfoInterestPayloads: TUpdatableUserInfoInterest[] = filteredInterestIds.map(
          () => ({
            userInfoInterestUpdatedTime: now,
          })
        );

        await this.userInfoInterestRepository.upsertUserInfoInterests(
          userInfoInterestObjs,
          userInfoInterestPayloads,
          tx
        );
      }

      // same logic as filteredInterestIds
      if (filteredPersonalGoalIds && filteredPersonalGoalIds.length > 0) {
        await this.userInfoPersonalGoalRepository.deleteUserInfoPersonalGoals(
          {
            userInfoPersonalGoalUserInfoId: userInfoId,
            userInfoPersonalGoalPersonalGoalIds: filteredPersonalGoalIds,
          },
          { isExcludePersonalGoalIds: true },
          tx
        );

        let basePos = await this.userInfoPersonalGoalRepository.findMaxPositionByUserInfoId(
          userInfoId,
          tx
        );

        if (basePos === -1) {
          basePos = 0;
        }

        const userInfoPersonalGoalObjs: TInsertableUserInfoPersonalGoal[] =
          filteredPersonalGoalIds.map((interestId, idx) => ({
            userInfoPersonalGoalId: generateUserInfoPersonalGoalId(),
            userInfoPersonalGoalUserInfoId: userInfoId,
            userInfoPersonalGoalPersonalGoalId: interestId,
            userInfoPersonalGoalPosition: basePos + idx + 1,
            userInfoPersonalGoalCreatedTime: now,
          }));

        const userInfoPersonalGoalPayloads: TUpdatableUserInfoPersonalGoal[] =
          filteredPersonalGoalIds.map(() => ({
            userInfoPersonalGoalUpdatedTime: now,
          }));

        await this.userInfoPersonalGoalRepository.upsertUserInfoPersonalGoals(
          userInfoPersonalGoalObjs,
          userInfoPersonalGoalPayloads,
          tx
        );
      }
    });

    return this.getMeProfileAgg(userId, userInfoId);
  }

  async getMeProfile() {
    const userId = this.clsService.get('user.id');

    const userInfo = await this.userInfoRepository.findUserInfoByUserId(userId);

    if (!userInfo) {
      throw new CustomHttpException('User info is not found', HttpErrorCode.NOT_FOUND);
    }

    const userInfoId = userInfo.userInfoId;

    return this.getMeProfileAgg(userId, userInfoId);
  }

  private async getMeProfileAgg(userId: string, userInfoId: string) {
    const userInfoAgg = await this.userInfoRepository.findUserInfoAggByUserInfoId(userInfoId);
    const user = await this.userRepository.findUserById(userId);

    if (!userInfoAgg) {
      throw new CustomHttpException(
        'Cannot found user info agg',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }
    if (!user) {
      throw new CustomHttpException('Cannot found user', HttpErrorCode.INTERNAL_SERVER_ERROR);
    }

    return {
      ...userInfoAgg,
      userDisplayName: user.userDisplayName,
    };
  }
}
