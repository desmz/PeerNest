import { customAlphabet } from 'nanoid';
import { uuidv7 } from 'uuidv7';

const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoId = customAlphabet(chars);

export function getRandomString(len: number) {
  return nanoId(len);
}

export enum IdPrefix {
  User = 'usr',
}

function generateUuid() {
  return uuidv7();
}

export function generateUserId() {
  return IdPrefix.User + '-' + generateUuid();
}
