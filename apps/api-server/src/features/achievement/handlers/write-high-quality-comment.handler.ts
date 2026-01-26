import { Injectable } from '@nestjs/common';

import { CommentRepository } from '@/persistence/repos/comment';

import { TAchievementCriteria, TAchievementEvaluationContext } from '../types';

import AchievementHandler from './achievement-handler';

@Injectable()
export class WriteHighQualityCommentHandler extends AchievementHandler<'writeHighQualityComment'> {
  constructor(private readonly commentRepository: CommentRepository) {
    super();
  }

  readonly criteriaType = 'writeHighQualityComment';

  async evaluate(
    criteria: TAchievementCriteria<'writeHighQualityComment'>,
    context: TAchievementEvaluationContext
  ): Promise<boolean> {
    const { commentCount, minLikes } = criteria;
    const { userId } = context;

    const comments = await this.commentRepository.findUserCommentsByLikeCount(userId, minLikes, {
      minOrMax: 'min',
    });

    return comments.length >= commentCount;
  }
}
