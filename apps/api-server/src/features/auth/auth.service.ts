import { Injectable } from '@nestjs/common';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import { HttpErrorCode } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import { UserRepository } from '@/features/user/user.repo';

import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
  ) {}

  async signup(signUpRo: TSignUpRo): Promise<{ accessToken: string }> {
    const { email } = signUpRo;

    const existingEmail = await this.userRepository.findUserByEmail(email, {
      includedDeleted: true,
    });
    if (existingEmail) {
      throw new CustomHttpException(
        `User ${email} is already registered or the account is deleted`,
        HttpErrorCode.CONFLICT
      );
    }

    const { password, ...otherSignUpRo } = signUpRo;
    const user = await this.userRepository.createUser(otherSignUpRo);

    return { accessToken: await this.tokenService.generateAccessToken(user) };
  }

  async signIn(signInRo: TSignInRo) {
    const { email } = signInRo;
    const user = await this.userRepository.findUserByEmail(email, { includedDeleted: true });

    if (!user) {
      throw new CustomHttpException(
        `User ${email} has not registered yet or the account is deleted`,
        HttpErrorCode.INVALID_CREDENTIALS
      );
    }

    if (user.deletedTime) {
      throw new CustomHttpException(
        `User ${email} is disabled or deleted`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

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
