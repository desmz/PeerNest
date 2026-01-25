export type TAchievementCriteriaType =
  | 'createAccount'
  | 'completeProfile'
  | 'makeDiscussion'
  | 'writeHighQualityComment'
  | 'receiveDiscussionLikes'
  | 'earnDiscussionLike'
  | 'maintainWellnessStreak'
  | 'coverAllWellnessFactors';

type TAchievementCriteriaMap = {
  createAccount: {
    type: 'createAccount';
    event: string;
  };
  completeProfile: {
    type: 'completeProfile';
    fields: [
      'displayName',
      'pronoun',
      'university',
      'domain',
      'bio',
      'lookingFor',
      'interests',
      'personalGoals',
    ];
  };
  makeDiscussion: {
    type: 'makeDiscussion';
    discussionCount: number;
  };
  writeHighQualityComment: {
    type: 'writeHighQualityComment';
    commentCount: number;
    minLikes: number;
  };
  receiveDiscussionLikes: {
    type: 'receiveDiscussionLikes';
    likes: number;
  };
  earnDiscussionLike: {
    type: 'earnDiscussionLike';
    discussionCount: number;
    minLikes: number;
  };
  maintainWellnessStreak: {
    type: 'maintainWellnessStreak';
    streaks: number;
  };
  coverAllWellnessFactors: {
    type: 'coverAllWellnessFactors';
    coverage: 'all';
  };
};

export type TAchievementCriteria<T extends TAchievementCriteriaType> = TAchievementCriteriaMap[T];

export type TAchievementCriteriaUnion = TAchievementCriteriaMap[keyof TAchievementCriteriaMap];

export type TAchievementEvaluationContext = {
  userId: string;
  timestamp?: Date;
  eventData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};
