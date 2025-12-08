export const ACCESS_TOKEN_STRATEGY_NAME = 'jwt';
export const GOOGLE_OAUTH_STRATEGY_NAME = 'google';

export const ACCESS_TOKEN_LOCAL_STORAGE = 'access_token';

export const AUTH_COOKIE_MAX_AGE = '5m';
export const AUTH_COOKIE_NAME = 'authToken';

export const MIN_PASSWORD_LEN = 6;

export const MIN_DISPLAY_NAME_LEN = 2;
export const MAX_DISPLAY_NAME_LEN = 32;

export const PERMITTED_USERNAMES = [
  'admin',
  'mod',
  'moderator',
  'here',
  'everyone',
  'peernest',
  'user',
];

export const MAX_AVATAR_SIZE = 3 * 1024 * 1024; // 3MB
export const AVATAR_MIMETYPE_REGEX = /(jpeg|png|gif)$/;

export enum AccountType {
  Local = 'local',
  Social = 'social',
}

export enum AccountProvider {
  Google = 'google',
  Password = 'password',
}
