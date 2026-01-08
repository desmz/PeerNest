import { Injectable } from '@nestjs/common';
import { HttpErrorCode, isEmptyObject } from '@peernest/core';

import { CustomHttpException } from '@/custom.exception';
import { UserInfoRepository, UserRepository } from '@/persistence/repos/user';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class CompleteProfileHandler extends AchievementHandler<'completeProfile'> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userInfoRepository: UserInfoRepository
  ) {
    super();
  }

  readonly criteriaType = 'completeProfile';

  async evaluate(
    criteria: TAchievementCriteria<'completeProfile'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { fields } = criteria;

    const { userId, eventData } = context;

    const userInfoId = eventData?.userInfoId as string | undefined;

    console.log({ userInfoId });

    if (!userInfoId) {
      throw new CustomHttpException(
        `User info id is missing in ${CompleteProfileHandler.name}`,
        HttpErrorCode.INTERNAL_SERVER_ERROR
      );
    }

    const [user, userInfoAgg] = await Promise.all([
      await this.userRepository.findUserById(userId),
      await this.userInfoRepository.findUserInfoAggByUserInfoId(userInfoId),
    ]);

    const fieldsValidator: Record<(typeof fields)[number], unknown> = {
      displayName: user?.userDisplayName,
      pronoun: userInfoAgg?.pronoun && !isEmptyObject(userInfoAgg.pronoun),
      university: userInfoAgg?.university && !isEmptyObject(userInfoAgg.university),
      domain: userInfoAgg?.domain && !isEmptyObject(userInfoAgg.domain),
      bio: userInfoAgg?.userInfoBio,
      lookingFor: userInfoAgg?.userInfoLookingFor,
      interests: userInfoAgg?.interests && userInfoAgg.interests.length > 0,
      personalGoals: userInfoAgg?.personalGoals && userInfoAgg.personalGoals.length > 0,
    };

    console.log(fieldsValidator);

    return fields.every((field) => Boolean(fieldsValidator[field]));
  }
}
