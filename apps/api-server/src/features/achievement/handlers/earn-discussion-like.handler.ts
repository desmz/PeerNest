import { Injectable } from '@nestjs/common';

import { DiscussionRepository } from '@/persistence/repos/discussion';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class EarnDiscussionLike extends AchievementHandler<'earnDiscussionLike'> {
  constructor(private readonly discussionRepository: DiscussionRepository) {
    super();
  }

  readonly criteriaType = 'earnDiscussionLike';

  async evaluate(
    criteria: TAchievementCriteria<'earnDiscussionLike'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { discussionCount, minLikes } = criteria;
    const { userId } = context;

    const discussions = await this.discussionRepository.findUserDiscussionsByLikeCount(
      userId,
      minLikes,
      { minOrMax: 'min' }
    );

    return discussions.length >= discussionCount;
  }
}
