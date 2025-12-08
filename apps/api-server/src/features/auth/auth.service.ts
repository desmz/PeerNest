import { join } from 'path';

import { Injectable } from '@nestjs/common';
import { TSignInRo, TSignUpRo } from '@peernest/contract';
import {
  AccountProvider,
  AccountType,
  comparePassword,
  encodePassword,
  generateAccountId,
  generateAttachmentId,
  generateUserId,
  HttpErrorCode,
  UploadType,
  UserRole,
} from '@peernest/core';
import { executeTx, KyselyService, TInsertableAttachment } from '@peernest/db';
import axios from 'axios';
import jdenticon, { toPng } from 'jdenticon';
import { Jimp } from 'jimp';

import { CustomHttpException } from '@/custom.exception';
import { AttachmentRepository } from '@/features/attachment/attachment.repo';
import StorageAdapter from '@/features/attachment/plugins/adapter';
import { InjectStorageAdapter } from '@/features/attachment/plugins/storage-provider';
import { RoleRepository } from '@/features/user/role.repo';
import { UserRepository } from '@/features/user/user.repo';

import { AccountRepository } from './account.repo';
import { TokenService } from './token.service';
import { TJwtRawPayload } from './types/jwt-payload.type';
import { TGoogleAuthRo } from './types/social-auth.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectStorageAdapter() private readonly storageAdapter: StorageAdapter,
    private readonly kyselyService: KyselyService,

    private readonly attachmentRepository: AttachmentRepository,
    private readonly accountRepository: AccountRepository,
    private readonly roleRepository: RoleRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService
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

    const avatarObj = await this.generateDefaultAvatar(userId);

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

  private async generateDefaultAvatar(hashValue: string): Promise<TInsertableAttachment> {
    const config = {
      lightness: {
        color: [0.4, 0.8],
        grayscale: [0.3, 0.9],
      },
      saturation: {
        color: 0.5,
        grayscale: 0.0,
      },
      backColor: '#0000',
    };

    jdenticon.configure(config);
    const avatarSideLength = 256;
    const mimetype = 'image/png';
    const avatarBuffer = toPng(hashValue, avatarSideLength);

    const path = `${join(StorageAdapter.getDir(UploadType.Avatar), hashValue)}.png`;
    const bucket = StorageAdapter.getBucket(UploadType.Avatar);

    const { hash } = await this.storageAdapter.uploadFile(
      bucket,
      path,
      avatarBuffer,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': mimetype,
      },
      true
    );

    if (!hash) {
      throw new CustomHttpException('Fail to upload avatar', HttpErrorCode.INTERNAL_SERVER_ERROR);
    }

    return {
      attachmentId: generateAttachmentId(),
      attachmentPath: path,
      attachmentName: hashValue,
      attachmentSize: avatarBuffer.length,
      attachmentMimetype: mimetype,
      attachmentWidth: avatarSideLength,
      attachmentHeight: avatarSideLength,
    };
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

    if (!user.userPasswordHash) {
      throw new CustomHttpException(
        `Please sign in with Google or other options`,
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

    // todo: add ban check

    await this.userRepository.updateUserById(
      {
        userLastSignedTime: new Date(),
      },
      user.userId
    );

    return { accessToken: await this.tokenService.generateAccessToken(user) };
  }

  async googleAuthenticateCallback(googleAuthRo: TGoogleAuthRo) {
    const { id: providerId, displayName, avatarUrl, email } = googleAuthRo;

    const existingUser = await this.userRepository.findUserByEmail(email);

    let jwtRawPayload: TJwtRawPayload | undefined;
    const now = new Date();
    if (!existingUser) {
      // 1. if avatar exist, download from google, else, create default avatar
      // 2. upload to s3 bucket, create user, account and attachment records
      const userId = generateUserId();
      let avatarObj: TInsertableAttachment | undefined;
      if (avatarUrl) {
        avatarObj = await this.processGoogleAvatar(avatarUrl, userId);
      } else {
        avatarObj = await this.generateDefaultAvatar(userId);
      }

      // 3. create the records
      const role = await this.roleRepository.findRoleByName(UserRole.User);

      if (!role) {
        throw new CustomHttpException(
          `${UserRole.User} role does not exist`,
          HttpErrorCode.NOT_FOUND
        );
      }

      jwtRawPayload = await executeTx(this.kyselyService.db, async (tx) => {
        const user = await this.userRepository.createUser(
          {
            userId: userId,
            userDisplayName: displayName,
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
            accountType: AccountType.Social,
            accountProvider: AccountProvider.Google,
            accountProviderUserId: providerId,
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

        return { userId, userEmail: user.userEmail };
      });
    } else {
      if (existingUser.userDeletedTime) {
        throw new CustomHttpException(
          `User ${email} is disabled or deleted`,
          HttpErrorCode.FREEZE_ACCOUNT
        );
      }

      // todo: add ban check

      const accounts = await this.accountRepository.findAccountsByUserId(existingUser.userId);

      // case 1: if no account, throw error
      if (!accounts || accounts.length === 0) {
        throw new CustomHttpException(
          `User ${email} has not registered yet or the account is deleted`,
          HttpErrorCode.INVALID_CREDENTIALS
        );
      }

      const googleAccount = accounts.find(
        (account) => account.accountProvider === AccountProvider.Google
      );

      // case 2: only google account or both google and password account exist
      if (googleAccount) {
        const { userId, userEmail } = await this.userRepository.updateUserById(
          {
            userLastSignedTime: now,
          },
          existingUser.userId
        );

        jwtRawPayload = { userId, userEmail };
      } else {
        // case 3: if only local account
        // 1. if avatar exist, download from google and upload to s3 bucket
        let avatarObj: TInsertableAttachment | undefined;
        if (avatarUrl) {
          avatarObj = await this.processGoogleAvatar(avatarUrl, existingUser.userId);
        }

        // 2. update attachment record (find by owner id), create google social account record, update last signed time
        jwtRawPayload = await executeTx(this.kyselyService.db, async (tx) => {
          if (avatarObj) {
            await this.attachmentRepository.updateAttachmentByOwnerId(
              avatarObj,
              existingUser.userId,
              tx
            );
          }

          await this.accountRepository.createAccount(
            {
              accountId: generateAccountId(),
              accountUserId: existingUser.userId,
              accountType: AccountType.Social,
              accountProvider: AccountProvider.Google,
              accountProviderUserId: providerId,
              accountCreatedTime: now,
            },
            tx
          );

          const { userId, userEmail } = await this.userRepository.updateUserById(
            {
              userLastSignedTime: now,
            },
            existingUser.userId,
            tx
          );

          return { userId, userEmail };
        });
      }
    }

    if (!jwtRawPayload) {
      throw new CustomHttpException(
        'User Jwt Raw Payload is not constructed correctly',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    return { accessToken: await this.tokenService.generateAccessToken(jwtRawPayload) };
  }

  /**
   * Fetch google avatar and upload to s3 bucket.
   * @param avatarUrl
   * @param hashValue
   * @returns
   */
  private async processGoogleAvatar(
    avatarUrl: string,
    hashValue: string
  ): Promise<TInsertableAttachment> {
    const googleAvatarRes = await axios.get(avatarUrl, {
      responseType: 'arraybuffer',
    });

    if (googleAvatarRes.status != 200) {
      throw new CustomHttpException(
        'Failed to get Google avatar',
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    const svgSize = [256, 256];
    const mimetype = 'image/png';
    const image = await Jimp.read(Buffer.from(googleAvatarRes.data));
    image.resize({ h: svgSize[0], w: svgSize[1] });
    const avatarBuffer = await image.getBuffer(mimetype);

    const path = `${join(StorageAdapter.getDir(UploadType.Avatar), hashValue)}.png`;
    const bucket = StorageAdapter.getBucket(UploadType.Avatar);

    const { hash } = await this.storageAdapter.uploadFile(
      bucket,
      path,
      avatarBuffer,
      {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'Content-Type': mimetype,
      },
      true
    );

    if (!hash) {
      throw new CustomHttpException('Fail to upload avatar', HttpErrorCode.INTERNAL_SERVER_ERROR);
    }

    return {
      attachmentId: generateAttachmentId(),
      attachmentPath: path,
      attachmentName: hashValue,
      attachmentSize: avatarBuffer.length,
      attachmentMimetype: mimetype,
      attachmentWidth: svgSize[0],
      attachmentHeight: svgSize[1],
    };
  }
}
