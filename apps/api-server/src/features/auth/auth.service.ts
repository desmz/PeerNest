import { Injectable } from '@nestjs/common';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import {
  AccountProvider,
  AccountType,
  comparePassword,
  encodePassword,
  generateAccountId,
  generateUserId,
  HttpErrorCode,
  UserRole,
} from '@peernest/core';
import { executeTx, KyselyService } from '@peernest/db';

import { CustomHttpException } from '@/custom.exception';
import { AttachmentRepository } from '@/features/attachment/attachment.repo';
import { RoleRepository } from '@/features/user/role.repo';
import { UserRepository } from '@/features/user/user.repo';
import { UserService } from '@/features/user/user.service';

import { AccountRepository } from './account.repo';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly kyselyService: KyselyService,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly accountRepository: AccountRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly userService: UserService
  ) {}

  async signup(signUpRo: TSignUpRo): Promise<{ accessToken: string }> {
    const { email, displayName, password } = signUpRo;

    const existingEmail = await this.userRepository.findUserByEmail(email, {
      includedDeleted: true,
    });
    if (existingEmail) {
      throw new CustomHttpException(
        `User ${email} is already registered or the account is deleted`,
        HttpErrorCode.CONFLICT
      );
    }

    const passwordHash = await encodePassword(password);
    const userId = generateUserId();

    const avatarObj = await this.userService.generateDefaultAvatar(userId);

    const role = await this.roleRepository.findRoleByName(UserRole.User);

    if (!role) {
      throw new CustomHttpException(
        `${UserRole.User} role does not exist`,
        HttpErrorCode.NOT_FOUND
      );
    }

    const user = await executeTx(this.kyselyService.db, async (tx) => {
      const now = new Date();

      const user = await this.userRepository.createUser(
        {
          userId: userId,
          userDisplayName: displayName,
          userPasswordHash: passwordHash,
          userRoleId: role.roleId,
          userEmail: email,
          userAvatarUrl: avatarObj.attachmentPath,
          userCreatedTime: now,
          userLastSignedTime: now,
        },
        tx
      );

      await this.accountRepository.createAccount(
        {
          accountId: generateAccountId(),
          accountUserId: user.userId,
          accountType: AccountType.Local,
          accountProvider: AccountProvider.Password,
          accountProviderUserId: passwordHash,
          accountCreatedTime: now,
        },
        tx
      );

      await this.attachmentRepository.createAttachment(
        {
          ...avatarObj,
          attachmentOwnerId: userId,
          attachmentCreatedTime: now,
        },
        tx
      );

      return user;
    });

    return { accessToken: await this.tokenService.generateAccessToken(user) };
  }

  async signIn(signInRo: TSignInRo) {
    const { email, password } = signInRo;
    const user = await this.userRepository.findUserByEmail(email, { includedDeleted: true });

    if (!user) {
      throw new CustomHttpException(
        `User ${email} has not registered yet or the account is deleted`,
        HttpErrorCode.INVALID_CREDENTIALS
      );
    }

    if (user && !user.userPasswordHash) {
      throw new CustomHttpException(
        `User ${email} is not registered with password`,
        HttpErrorCode.INVALID_CREDENTIALS
      );
    }

    const isPasswordValid = await comparePassword(password, user.userPasswordHash);

    if (!isPasswordValid) {
      throw new CustomHttpException('Invalid password', HttpErrorCode.INVALID_CREDENTIALS);
    }

    if (user.userDeletedTime) {
      throw new CustomHttpException(
        `User ${email} is disabled or deleted`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    await this.userRepository.updateUserById(
      {
        userLastSignedTime: new Date(),
      },
      user.userId
    );

    return { accessToken: await this.tokenService.generateAccessToken(user) };
  }

  // async googleAuthenticateCallback(googleAuthRo: GoogleAuthRo) {
  //   const { id: providerId, displayName: name, avatarUrl, email } = googleAuthRo;

  //   const existingUser = await this.userRepo.findUserByEmail(email);

  //   let user: SelectableUser | undefined = existingUser;
  //   if (!existingUser) {
  //     await executeTx(this.db, async (trx) => {
  //       user = await this.userRepo.insertUser({ email, name, avatarUrl }, trx);

  //       await this.accountRepo.insertAccount(
  //         {
  //           providerId,
  //           provider: 'google',
  //           userId: user.id,
  //           type: 'oauth',
  //         },
  //         trx
  //       );
  //     });
  //   } else {
  //     const existingAccount = await this.accountRepo.findAccountByUserId(existingUser.id);

  //     if (!existingAccount) {
  //       await executeTx(this.db, async (trx) => {
  //         await this.userRepo.updateUser({ avatarUrl }, existingUser.id, trx);

  //         await this.accountRepo.insertAccount(
  //           {
  //             providerId,
  //             provider: 'google',
  //             userId: existingUser.id,
  //             type: 'oauth',
  //           },
  //           trx
  //         );
  //       });
  //     }
  //   }

  //   return { accessToken: await this.tokenService.generateAccessToken(user!) };
  // }
}
