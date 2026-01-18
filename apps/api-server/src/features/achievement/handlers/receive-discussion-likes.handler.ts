import { Injectable } from '@nestjs/common';

import { DiscussionRepository } from '@/persistence/repos/discussion';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class ReceiveDiscussionLikesHandler extends AchievementHandler<'receiveDiscussionLikes'> {
  constructor(private readonly discussionRepository: DiscussionRepository) {
    super();
  }

  readonly criteriaType = 'receiveDiscussionLikes';

  async evaluate(
    criteria: TAchievementCriteria<'receiveDiscussionLikes'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { likes } = criteria;
    const { userId } = context;

    const totalLikeCountObj =
      await this.discussionRepository.findTotalLikesAcrossUserDiscussions(userId);

    if (!totalLikeCountObj) {
      throw Error('Failed to find total like count obj');
    }

    return totalLikeCountObj.totalLikeCount >= likes;
  }
}
