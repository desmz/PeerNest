const USER_BASE = '/users';
const USER_ME = `/me`;

export const APP_ROUTE = {
  // auth
  SIGN_UP: '/signup',
  SIGN_IN: '/signin',
  SIGN_OUT: '/signout',
  FORGET_PASSWORD: '/forget-password',
  RESET_PASSWORD: '/reset-password',

  // protected
  HOME: '/home',
  USER: `${USER_BASE}`,
  BAN: '/ban',
  MANAGE: '/manage',
  USER_ME: USER_ME,
  PROFILE_DISCUSSION_POST: `${USER_ME}/discussions`,
  WELLNESS: `${USER_ME}/wellness`,
  ACHIEVEMENTS: `${USER_ME}/achievements`,
  DISCUSSION: '/discussions',
  MANAGE_DISCUSSIONS: '/manage/discussions',
};
