import { UserRole } from './role.constant';

export enum DiscussionStatus {
  Active = 'active',
  Archived = 'archived',
  Deleted = 'deleted',
}

export enum ReportedContentStatus {
  Reported = 'reported',
  Deleted = 'deleted',
  Released = 'released',
}

export enum UserDiscussionReportStatus {
  Reported = ReportedContentStatus.Reported,
  Deleted = ReportedContentStatus.Deleted,
  Released = ReportedContentStatus.Released,
}

export enum UserCommentReportStatus {
  Reported = ReportedContentStatus.Reported,
  Deleted = ReportedContentStatus.Deleted,
  Released = ReportedContentStatus.Released,
}

export enum FindDiscussionCommentsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
  Liked = 'liked',
}

export enum FindDiscussionsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
  Liked = 'liked',
  Trending = 'trending',
}

export const MIN_DISCUSSION_TITLE_LEN = 5;
export const MAX_DISCUSSION_TITLE_LEN = 100;
export const MIN_DISCUSSION_CONTENT_LEN = 1;
export const MAX_DISCUSSION_CONTENT_LEN = 5000;
export const MAX_DISCUSSION_INTEREST_TAGS = 3;
export const MAX_DISCUSSION_GOAL_TAGS = 3;

export const ALLOWED_DELETE_DISCUSSION_USER_ROLE = [UserRole.Admin, UserRole.Moderator];

export enum FindArchivedDiscussionsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
}
