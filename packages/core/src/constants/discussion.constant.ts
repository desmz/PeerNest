export enum DiscussionStatus {
  Active = 'active',
  Archived = 'archived',
  Deleted = 'deleted',
}

export enum UserDiscussionReportStatus {
  Reported = 'reported',
  Deleted = 'deleted',
  Released = 'released',
}

export enum UserCommentReportStatus {
  Reported = 'reported',
  Deleted = 'deleted',
  Released = 'released',
}

export enum FindDiscussionCommentsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
  Liked = 'liked',
}

export const MIN_DISCUSSION_TITLE_LEN = 5;
export const MAX_DISCUSSION_TITLE_LEN = 100;
export const MIN_DISCUSSION_CONTENT_LEN = 1;
export const MAX_DISCUSSION_CONTENT_LEN = 5000;
export const MAX_DISCUSSION_INTEREST_TAGS = 3;
export const MAX_DISCUSSION_GOAL_TAGS = 3;
