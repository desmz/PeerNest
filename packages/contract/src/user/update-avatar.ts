import { TApiMethod } from '../types';

export const UPDATE_AVATAR_METHOD: TApiMethod = 'patch';

export const UPDATE_AVATAR_URL = '/me/avatar';

export const updateAvatarField = {
  avatar: 'Avatar',
} as const;

// No schema needed, as it will be handled at the backend
