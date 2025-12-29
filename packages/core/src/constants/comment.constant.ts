export enum FindUserCommentsSortOption {
  Oldest = 'oldest',
  Newest = 'newest',
  Liked = 'liked',
}

export enum FindUserCommentsType {
  Replies = 'replies',
  Comments = 'comments',
}

export const MIN_COMMENT_CONTENT_LEN = 1;
export const MAX_COMMENT_CONTENT_LEN = 5000;
