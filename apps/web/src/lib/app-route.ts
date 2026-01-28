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
  USER_ME: USER_ME,
  BAN: '/ban',
  MANAGE: '/manage',
  ACHIEVEMENT: '/achievement',
  DISCUSSION: '/discussions',
  PROFILE_DISCUSSION_POST: 'me/profile',
  MANAGE_DISCUSSIONS: '/manage/discussions',
  WELLNESS: `${USER_ME}/wellness`,
};
