import { Injectable } from '@nestjs/common';
import { DiscussionStatus } from '@peernest/core';

import { DiscussionRepository } from '@/persistence/repos/discussion';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class MakeDiscussionHandler extends AchievementHandler<'makeDiscussion'> {
  constructor(private readonly discussionRepository: DiscussionRepository) {
    super();
  }

  readonly criteriaType = 'makeDiscussion';

  async evaluate(
    criteria: TAchievementCriteria<'makeDiscussion'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { userId } = context;

    const discussions = await this.discussionRepository.findDiscussionsByUserId(userId, {
      statuses: [DiscussionStatus.Active],
    });

    return discussions.length >= criteria.discussionCount;
  }
}
