import { Injectable } from '@nestjs/common';
import {
  TAddPercherRo,
  TCounselorUser,
  TGetMyPerchersQueryParams,
  TGetMyPerchersVo,
  TReleasePercherParams,
  TUpdatePercherNoteParams,
  TUpdatePercherNoteRo,
} from '@peernest/contract';
import { generateCounselorUserId, HttpErrorCode } from '@peernest/core';
import { ClsService } from 'nestjs-cls';

import { CustomHttpException } from '@/custom.exception';
import { BanActionRepository } from '@/persistence/repos/ban';
import { CounselorUserRepository } from '@/persistence/repos/counselor';
import { UserRepository } from '@/persistence/repos/user';
import { IClsStore } from '@/types/cls';

import { getFullStorageUrl } from '../attachment/utils';

@Injectable()
export class CounselorService {
  constructor(
    private readonly clsService: ClsService<IClsStore>,

    private readonly banActionRepository: BanActionRepository,
    private readonly counselorUserRepository: CounselorUserRepository,
    private readonly userRepository: UserRepository
  ) {}

  async addPercher(addPercherRo: TAddPercherRo): Promise<void> {
    const { note, percherId } = addPercherRo;

    const userId = this.clsService.get('user.id');

    const percher = await this.userRepository.findUserById(percherId);

    if (!percher) {
      throw new CustomHttpException(`User ${percherId} does not exist`, HttpErrorCode.NOT_FOUND);
    }

    const now = new Date();
    const isBanned = await this.banActionRepository.validateIfUserIsBanned(userId, now);

    if (isBanned) {
      throw new CustomHttpException(
        `User ${percherId} have been banned or suspended`,
        HttpErrorCode.FREEZE_ACCOUNT
      );
    }

    if (userId === percherId) {
      throw new CustomHttpException(
        `You cannot add yourself as the percher`,
        HttpErrorCode.RESTRICTED_RESOURCE
      );
    }

    const existingCounselorUser = await this.counselorUserRepository.findCounselorUserByIds({
      counselorId: userId,
      userId: percherId,
    });

    if (existingCounselorUser) {
      throw new CustomHttpException(
        `You already have an active counseling session with the user ${percherId}`,
        HttpErrorCode.CONFLICT
      );
    }

    await this.counselorUserRepository.createCounselorUser({
      counselorUserId: generateCounselorUserId(),
      counselorUserCounselorId: userId,
      counselorUserUserId: percherId,
      counselorUserNote: note,
      counselorUserCreatedTime: now,
    });

    // todo: send notification to the percher
  }

  async updatePercherNote(
    updatePercherNoteParams: TUpdatePercherNoteParams,
    updatePercherNoteRo: TUpdatePercherNoteRo
  ): Promise<void> {
    const { percherId } = updatePercherNoteParams;
    const { note } = updatePercherNoteRo;

    const userId = this.clsService.get('user.id');

    const counselorUser = await this.counselorUserRepository.findCounselorUserByIds({
      counselorId: userId,
      userId: percherId,
    });

    if (!counselorUser) {
      throw new CustomHttpException(
        `Active counseling session does not exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    await this.counselorUserRepository.updateCounselorUserByIds(
      {
        counselorUserNote: note,
        counselorUserUpdatedTime: now,
      },
      { counselorId: userId, userId: percherId }
    );
  }

  async releasePercher(releasePercherParams: TReleasePercherParams): Promise<void> {
    const { percherId } = releasePercherParams;

    const userId = this.clsService.get('user.id');

    const counselorUser = await this.counselorUserRepository.findCounselorUserByIds({
      counselorId: userId,
      userId: percherId,
    });

    if (!counselorUser) {
      throw new CustomHttpException(
        `Active counseling session does not exist`,
        HttpErrorCode.CONFLICT
      );
    }

    const now = new Date();
    await this.counselorUserRepository.updateCounselorUserByIds(
      {
        counselorUserReleasedTime: now,
        counselorUserUpdatedTime: now,
      },
      { counselorId: userId, userId: percherId }
    );

    // todo: send notification to the percher
  }

  async getMyPerchers(
    getMyPerchersQueryParams: TGetMyPerchersQueryParams
  ): Promise<TGetMyPerchersVo> {
    const userId = this.clsService.get('user.id');

    const counselorUserObjs = await this.counselorUserRepository.findPerchersByCounselorId(
      userId,
      getMyPerchersQueryParams
    );

    const formattedCounselorUserObjs = counselorUserObjs.map(
      (counselorUserObjs): TCounselorUser => {
        return {
          counselorUserId: counselorUserObjs.counselorUserId,
          counselorUserCounselorId: counselorUserObjs.counselorUserCounselorId,
          counselorUserNote: counselorUserObjs.counselorUserNote,
          counselorUserUpdatedTime: counselorUserObjs.counselorUserUpdatedTime,
          user: {
            userId: counselorUserObjs.userId,
            userDisplayName: counselorUserObjs.userDisplayName,
            userAvatarUrl: getFullStorageUrl(counselorUserObjs.userAvatarUrl),
            roleName: counselorUserObjs.roleName,
            pronoun: counselorUserObjs.userPronoun,
            university: counselorUserObjs.userUniversity,
            domain: counselorUserObjs.userDomain,
            userInfoLookingFor: counselorUserObjs.userInfoLookingFor,
            interests: counselorUserObjs.userInterest,
            personalGoals: counselorUserObjs.userPersonalGoal,
          },
        };
      }
    );

    return {
      count: formattedCounselorUserObjs.length,
      counselorUsers: formattedCounselorUserObjs,
    };
  }
}
